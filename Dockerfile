FROM node:16

ARG UID
ARG GID

# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN curl -L https://github.com/ncopa/su-exec/archive/master.tar.gz | tar xvz && \
  cd su-exec-* && make && mv su-exec /usr/local/bin && cd .. && rm -rf su-exec-*

WORKDIR /workspace/app

COPY package.json yarn.lock /workspace/app/

RUN yarn install

COPY . /workspace/app

ENV NODE_ENV production

CMD ["yarn", "start:prod"]
