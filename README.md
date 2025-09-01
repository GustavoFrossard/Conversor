# 💱 Conversor de Moedas Moderno

Um conversor de moedas **responsivo**, **moderno** e **interativo**, feito com **HTML**, **CSS** e **JavaScript**, utilizando a [Frankfurter API](https://www.frankfurter.dev/) para buscar cotações em tempo real **sem necessidade de chave de API**.

---

## ✨ Funcionalidades

- 🔄 Conversão entre diversas moedas do mundo
- 📅 Cotação atualizada diariamente (dados do Banco Central Europeu)
- 🌙 Alternância entre modo claro e escuro
- 📱 Layout responsivo para desktop 

---

# Pré-requisitos
Instância EC2 com Ubuntu Server (22.04 LTS ou superior)

Security Group configurado para portas: 22 (SSH), 80 (HTTP), 443 (HTTPS)

Acesso SSH à instância

# Etapa 1: Preparar o servidor LAMP

Atualizar sistema
sudo apt update && sudo apt upgrade -y

Instalar Apache, PHP e dependências
sudo apt install -y apache2 wget php-fpm php-mysql php-json php php-dev libapache2-mod-php

Instalar MySQL Server
sudo apt install -y mysql-server

Iniciar e habilitar Apache
sudo systemctl start apache2
sudo systemctl enable apache2

Verificar status do Apache
sudo systemctl is-enabled apache2

Configurar permissões do usuário
sudo usermod -a -G www-data $USER
exit

Reconectar e verificar grupos
groups

Configurar permissões de diretórios
sudo chown -R $USER:www-data /var/www
sudo chmod 2775 /var/www && find /var/www -type d -exec sudo chmod 2775 {} \;
find /var/www -type f -exec sudo chmod 0664 {} \;

# Etapa 2: Testar o servidor LAMP

Criar arquivo de teste PHP
echo "<?php phpinfo(); ?>" > /var/www/html/phpinfo.php

Verificar pacotes instalados
dpkg -l | grep -E 'apache2|mysql-server|php'

Remover arquivo de teste (após verificação)
rm /var/www/html/phpinfo.php

# Etapa 3: Proteger o servidor de banco de dados

Executar script de segurança do MySQL
sudo mysql_secure_installation

Configurar autenticação do root (se necessário)
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_senha_segura';"

Reiniciar MySQL
sudo systemctl restart mysql

# Etapa 4: Configurar SSL/TLS

Habilitar módulo SSL do Apache
sudo a2enmod ssl

Criar diretório para certificados
sudo mkdir /etc/apache2/ssl

Gerar certificado autoassinado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/apache2/ssl/apache-selfsigned.key -out /etc/apache2/ssl/apache-selfsigned.crt

Habilitar site padrão SSL
sudo a2ensite default-ssl

Reiniciar Apache
sudo systemctl restart apache2

# Etapa 5: Instalar phpMyAdmin

Instalar phpMyAdmin
sudo apt install -y phpmyadmin

Durante a instalação, selecione:
- Servidor web: apache2
- Configurar banco de dados com dbconfig-common: Sim

Criar link simbólico (se necessário)
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin

Instalar extensões PHP necessárias
sudo apt install -y php-mbstring php-xml php-zip

Reiniciar Apache
sudo systemctl restart apache2

# Comandos Adicionais Úteis

Verificar status dos serviços
sudo systemctl status apache2
sudo systemctl status mysql

Ver logs do Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

Configurar firewall (UFW)
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH
sudo ufw enable

Verificar configuração SSL
sudo apache2ctl -t
sudo apache2ctl -S

# Acessos
Site: http://endereco-dns-publico

PHP Info: http://endereco-dns-publico/phpinfo.php (remover após testes)

phpMyAdmin: http://endereco-dns-publico/phpmyadmin

Site HTTPS: https://endereco-dns-publico

# Arquivos de Configuração Importantes
Apache: /etc/apache2/apache2.conf

Virtual Hosts: /etc/apache2/sites-available/

SSL Config: /etc/apache2/mods-available/ssl.conf

PHP Config: /etc/php/8.x/apache2/php.ini (versão pode variar)

MySQL Config: /etc/mysql/mysql.conf.d/mysqld.cnf

# Notas Importantes
No Ubuntu, o grupo do Apache é www-data (ao invés de apache)

O phpMyAdmin é instalado via repositório oficial do Ubuntu

Use apt instead de dnf para gerenciamento de pacotes
