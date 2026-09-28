# ==============================================================================
# ESTÁGIO 1: Builder (Node.js 20 Alpine)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências do projeto usando package-lock.json garantindo reprodutibilidade
COPY package.json package-lock.json ./
RUN npm ci

# Copia código-fonte da aplicação
COPY . .

# Executa type-check rigoroso e build de produção Vite + PWA Workbox
RUN npm run build

# ==============================================================================
# ESTÁGIO 2: Runtime ultraleve (Nginx Alpine < 25 MB)
# ==============================================================================
FROM nginx:alpine AS runner

# Configurações para conformidade com o Google Cloud Run ($PORT dinâmica)
ENV PORT=8080
ENV NGINX_ENVSUBST_FILTER="PORT"

# Remove arquivos estáticos padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia artefatos estáticos otimizados compilados pelo Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia o template do Nginx (processado pelo script 20-envsubst-on-templates.sh nativo do nginx:alpine)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Prepara arquivo de fallback padrão para execução local sem envsubst
RUN sed 's/\${PORT}/8080/g' /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Healthcheck interno para verificação de liveness
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/healthz || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
