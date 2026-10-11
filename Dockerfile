# ==============================================================================
# ESTÁGIO 1: verificação e build (Node.js 24 LTS)
# ==============================================================================
FROM node:24-alpine AS builder

WORKDIR /app

# Dependências reproduzíveis a partir do package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Portão de qualidade: sem type-check e testes verdes (doses, kits, 2 vias da
# Portaria 344/98, consentimento de CID-10, folha dos documentos) a imagem não
# é construída — e, portanto, nada é publicado.
RUN npm run lint && npm run test

RUN npm run build

# ==============================================================================
# ESTÁGIO 2: runtime (Nginx Alpine servindo os arquivos estáticos)
# ==============================================================================
FROM nginx:alpine AS runner

# Cloud Run informa a porta em $PORT; o entrypoint do nginx substitui apenas
# essa variável no template (as variáveis do próprio nginx, como $uri, ficam).
ENV PORT=8080
ENV NGINX_ENVSUBST_FILTER="PORT"

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY nginx-security-headers.conf /etc/nginx/snippets/security-headers.conf

# Valida a configuração já no build: erro de sintaxe do nginx quebra a imagem
# aqui, e não na subida do contêiner em produção.
RUN PORT=8080 envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf \
    && nginx -t

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
