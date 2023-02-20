#####################
## STAGE 1 - BUILD ##
#####################
FROM node:18-buster-slim as builder

# Install Python3 used in dependencies for building
RUN apt update && \
    apt install -y python3 make

# BUILD BACK END
WORKDIR /usr/src/app/backend
COPY ./backend/package.json /usr/src/app/backend
COPY ./backend/package-lock.json /usr/src/app/backend
RUN mkdir /usr/src/app/backend/vendor
COPY ./backend/vendor /usr/src/app/backend/vendor
RUN node --version && npm --version
RUN npm ci

COPY /backend /usr/src/app/backend/
RUN npm run prebuild

RUN cp src/config/licensing-portal-config/misc.prod.ts src/config/misc.ts
RUN npm run build:prod:webpack
RUN npm prune --production

# manually install a couple npm packages
RUN rm -f node_modules/@nestjs-modules/mailer && rm -f node_modules/knexnest && \
  cp -r vendor/nestjs-mailer node_modules/@nestjs-modules/mailer && \
  cp -r vendor/knexnest node_modules/knexnest

# BUILD FRONT END
WORKDIR /usr/src/app/frontend
COPY ./frontend/package.json /usr/src/app/frontend
COPY ./frontend/package-lock.json /usr/src/app/frontend
WORKDIR /usr/src/app/frontend/vendor
COPY ./frontend/vendor /usr/src/app/frontend/vendor
RUN npm ci

WORKDIR /usr/src/app
COPY ./frontend /usr/src/app/frontend

WORKDIR /usr/src/app/frontend
RUN npm run build:prod
RUN npm prune --production

######################
## Stage 2: DELIVER ##
######################
FROM node:16-alpine

# Make the app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/backend/dist /usr/src/app
COPY --from=builder /usr/src/app/backend/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/backend/vendor /usr/src/app/vendor

# Upgrade npm
RUN npm install -g npm

# Create non root user
RUN addgroup -g 1050 -S limitedaccessaccount && \
    adduser -u 1050 -S limitedaccessaccount -G limitedaccessaccount && \
    mkdir -p /usr/src/app/mnt/storage && \
    chown -R limitedaccessaccount:limitedaccessaccount /usr/src/app

# Set non root user
USER 1050

# Expose the port the dashboard is on
EXPOSE 3000

# Start the server
CMD [ "node", "main" ]
