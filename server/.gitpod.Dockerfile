FROM gitpod/workspace-full
USER gitpod

#Install Google key
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - 

RUN sudo apt-get update && \
    sudo apt-get install -y zsh

# set the zsh theme 
ENV ZSH_THEME cloud


#install NG CLI
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN npm i npm -g

RUN wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh

RUN sh install.sh

RUN curl https://cli-assets.heroku.com/install.sh | sh
