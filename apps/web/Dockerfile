FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/employer/package.json apps/employer/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/hooks/package.json packages/hooks/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ARG APP_WORKSPACE=@career-os/web
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace ${APP_WORKSPACE}

FROM node:20-alpine AS run
WORKDIR /app
ARG APP_DIR=apps/web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/${APP_DIR}/.next ./${APP_DIR}/.next
COPY --from=build /app/${APP_DIR}/public ./${APP_DIR}/public
COPY --from=build /app/${APP_DIR}/package.json ./${APP_DIR}/package.json
COPY --from=build /app/packages ./packages
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@career-os/web"]
