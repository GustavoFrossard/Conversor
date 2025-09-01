# 💱 Conversor de Moedas Moderno

Um conversor de moedas **responsivo**, **moderno** e **interativo**, feito com **HTML**, **CSS** e **JavaScript**, utilizando a [Frankfurter API](https://www.frankfurter.dev/) para buscar cotações em tempo real **sem necessidade de chave de API**.

---

## ✨ Funcionalidades

- 🔄 Conversão entre diversas moedas do mundo
- 📅 Cotação atualizada diariamente (dados do Banco Central Europeu)
- 🌙 Alternância entre modo claro e escuro
- 📱 Layout responsivo para desktop 

---

Pré-requisitos
Instância EC2 com Amazon Linux 2023

Security Group configurado para portas: 22 (SSH), 80 (HTTP), 443 (HTTPS)

Acesso SSH à instância

Etapa 1: Preparar o servidor LAMP
bash
# Atualizar sistema
sudo dnf upgrade -y

# Instalar Apache, PHP e dependências
sudo dnf install -y httpd wget php-fpm php-mysqli php-json php php-devel

# Instalar MariaDB
sudo dnf install -y mariadb105-server

# Iniciar e habilitar Apache
sudo systemctl start httpd
sudo systemctl enable httpd

# Verificar status do Apache
sudo systemctl is-enabled httpd

# Configurar permissões do usuário
sudo usermod -a -G apache ec2-user
exit

# Reconectar e verificar grupos
groups

# Configurar permissões de diretórios
sudo chown -R ec2-user:apache /var/www
sudo chmod 2775 /var/www && find /var/www -type d -exec sudo chmod 2775 {} \;
find /var/www -type f -exec sudo chmod 0664 {} \;
Etapa 2: Testar o servidor LAMP
bash
# Criar arquivo de teste PHP
echo "<?php phpinfo(); ?>" > /var/www/html/phpinfo.php

# Verificar pacotes instalados
sudo dnf list installed httpd mariadb105 php8.4

# Remover arquivo de teste (após verificação)
rm /var/www/html/phpinfo.php
Etapa 3: Proteger o servidor de banco de dados
bash
# Iniciar e configurar MariaDB
sudo systemctl start mariadb
sudo mysql_secure_installation

# Parar MariaDB (opcional)
sudo systemctl stop mariadb

# Habilitar inicialização automática (opcional)
sudo systemctl enable mariadb
Etapa 4: Configurar SSL/TLS
bash
# Instalar OpenSSL e módulo SSL para Apache
sudo dnf install -y openssl mod_ssl

# Gerar certificado autoassinado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/pki/tls/private/apache-selfsigned.key -out /etc/pki/tls/certs/apache-selfsigned.crt

# Reiniciar Apache
sudo systemctl restart httpd
Etapa 5: Instalar phpMyAdmin
bash
# Instalar dependências
sudo dnf -y install php-mbstring php-xml

# Reiniciar serviços
sudo systemctl restart httpd
sudo systemctl restart php-fpm

# Navegar para diretório web
cd /var/www/html

# Download e instalação do phpMyAdmin
wget https://www.phpmyadmin.net/downloads/phpMyAdmin-latest-all-languages.tar.gz
mkdir phpMyAdmin && tar -xvzf phpMyAdmin-latest-all-languages.tar.gz -C phpMyAdmin --strip-components 1
rm phpMyAdmin-latest-all-languages.tar.gz

# Iniciar MariaDB (se necessário)
sudo systemctl start mariadb
Acessos
Site: http://endereco-dns-publico

PHP Info: http://endereco-dns-publico/phpinfo.php (remover após testes)

phpMyAdmin: https://endereco-dns-publico/phpMyAdmin

Site HTTPS: https://endereco-dns-publico

Notas Importantes
O certificado SSL autoassinado gerará avisos de segurança no navegador

Para produção, use certificados de uma Autoridade Certificadora (CA) confiável

Configure adequadamente as regras de Security Group para produção

Mantenha o sistema atualizado regularmente com sudo dnf upgrade -y
