# Todo corre en Docker con la imagen oficial node:24 (LTS): no hace falta Node
# en el equipo. Las demás versiones de Node las prueba el CI.
#
# La caché de npm queda en ~/.npm, compartida entre ejecuciones.

TTY   := $(shell [ -t 0 ] && echo -t)
CACHE := $(HOME)/.npm
RUN    = docker run --rm -i $(TTY) -u $$(id -u):$$(id -g) \
         -v $(CURDIR):/app -v $(CACHE):/tmp/cache -e npm_config_cache=/tmp/cache -e HOME=/tmp \
         -e npm_config_update_notifier=false \
         -w /app node:24-alpine

.PHONY: help install update test lint format build check fixtures publicar npm shell

help:           ## Lista los comandos
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

$(CACHE):
	@mkdir -p $@

install: | $(CACHE) ## Instala las dependencias
	$(RUN) npm ci

update: | $(CACHE) ## Actualiza las dependencias
	$(RUN) npm update

test:           ## Corre Vitest (make test a="ruc")
	$(RUN) npx vitest run $(a)

lint:           ## Biome y tipos, sin cambiar nada (como el CI)
	$(RUN) npm run lint

format:         ## Formatea con Biome
	$(RUN) npm run format

build:          ## Compila a dist/
	$(RUN) npm run build

check:          ## Revisa el paquete que se publicaría (publint y attw)
	$(RUN) npm run check

fixtures: | $(CACHE) ## Descarga los casos compartidos de laravel-peru-rules
	$(RUN) npm run fixtures

# Solo para la primera versión: las siguientes las publica el CI al crear un
# release. El login vive dentro del contenedor y se pierde al salir.
publicar: | $(CACHE) ## Publica en npm a mano, con login y 2FA
	$(RUN) sh -c 'npm ci && npm test && npm run check && npm login && npm publish --access public'

npm: | $(CACHE) ## make npm c="install -D paquete"
	$(RUN) npm $(c)

shell:          ## sh dentro del contenedor
	$(RUN) sh
