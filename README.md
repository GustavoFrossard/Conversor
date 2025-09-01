# 💱 Conversor de Moedas Moderno

Um conversor de moedas **responsivo**, **moderno** e **interativo**, feito com **HTML**, **CSS** e **JavaScript**, utilizando a [Frankfurter API](https://www.frankfurter.dev/) para buscar cotações em tempo real **sem necessidade de chave de API**.

---

## ✨ Funcionalidades

- 🔄 Conversão entre diversas moedas do mundo
- 📅 Cotação atualizada diariamente (dados do Banco Central Europeu)
- 🌙 Alternância entre modo claro e escuro
- 📱 Layout responsivo para desktop 

---
🗄️ Banco de Dados
O banco de dados utilizado é o MariaDB, com a seguinte configuração:

Database: meu_site
Tabela: cadastro
Estrutura da Tabela cadastro
CREATE TABLE cadastro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

⚙️ Passo a Passo de Instalação
1. Atualizar pacotes
sudo apt update && sudo apt upgrade -y
2. Instalar Apache, PHP e MariaDB
sudo apt install -y apache2 mariadb-server php libapache2-mod-php php-mysql git
3. Iniciar e habilitar serviços
sudo systemctl enable apache2
sudo systemctl start apache2
sudo systemctl enable mariadb
sudo systemctl start mariadb
4. Clonar o repositório
cd /var/www/html
sudo git clone https://github.com/guualonso/desafio-implementando-cliente-servidor-aws.git
5. Configurar permissões
sudo chown -R www-data:www-data /var/www/html/desafio-implementando-cliente-servidor-aws
sudo chmod -R 755 /var/www/html/desafio-implementando-cliente-servidor-aws
6. Criar o banco de dados
sudo mysql -u root -p
CREATE DATABASE meu_site;
USE meu_site;

CREATE TABLE cadastro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
▶️ Executando o Projeto
Acesse o navegador no endereço público da instância EC2:

http://SEU-IP-PUBLICO/index.html
Preencha o formulário e clique em Enviar.

Para listar os cadastros feitos, acesse:

http://SEU-IP-PUBLICO/listar.php
📌 Observações
Certifique-se de abrir a porta 80 (HTTP) no Security Group da instância EC2.
O phpMyAdmin pode ser instalado em /var/www/html/phpmyadmin para gerenciar o banco graficamente:
sudo apt install phpmyadmin
📎 Links Importantes
Repositório do Projeto no GitHub: Desafio Cliente Servidor AWS
