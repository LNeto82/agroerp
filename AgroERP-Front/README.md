<div align="center">
  <h1 align="center">AgroERP Enterprise</h1>
  <p align="center">Sistema de Gestão Full Stack para o Agronegócio com Arquitetura Corporativa.</p>
  
  <a href="./Apresentacao.pdf" target="_blank">
    <img src="https://img.shields.io/badge/Ver_Slides_de_Apresentação-PDF-red?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white" alt="Ver Apresentação" />
  </a>
</div>

<br />

---

## 📝 Resumo do Projeto
Desenvolvi um ERP Full Stack robusto para o agronegócio utilizando **Java Spring Boot 3** no backend e **React (Vite)** no frontend. A arquitetura segue padrões Enterprise com camadas isoladas (Service/Controller/Repository), uso de DTOs para segurança de dados e persistência em **MySQL**. O sistema implementa segurança avançada com **Spring Security e JWT**, garantindo controle de acesso baseado em função (RBAC) para segregar a visão gerencial (Admin) da operacional (Vendedor).

---

## 🛠️ Ferramentas Utilizadas

* **Java 21 e Spring Boot 3.5:** Padrão de mercado para sistemas Enterprise.
* **Spring Security e JWT:** Autenticação stateless e proteção contra ataques.
* **MySQL e Spring Data JPA:** Persistência relacional e abstração de SQL.
* **React e Vite:** Performance superior e hot-reload instantâneo.
* **Material UI (MUI):** Visual corporativo e responsivo.
* **Recharts:** Dashboards gerenciais com gráficos em tempo real.
* **Swagger (OpenAPI):** Documentação técnica automática da API.

---

## 🎯 O Desafio Técnico (RBAC)
A parte mais complexa foi a implementação da **Segurança e Segregação de Dados**.
Configurar o Spring Security para aceitar o Login, gerar o Token JWT e **filtrar os dados no Backend** para que o Vendedor visse apenas as suas próprias vendas exigiu uma arquitetura sólida usando DTOs e Services.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* Java 17 ou superior
* Node.js
* MySQL

### Passos
1. Clone o repositório.
2. Configure o banco de dados MySQL (`agro_erp`).
3. Rode o Backend (Spring Boot) na porta 8080.
4. Rode o Frontend (React) na porta 5173.
5. **Logins de Teste:**
   * **Admin:** `admin` / `admin123`
   * **Vendedor:** `ana` / `123456`

---

### 🔗 Link do Repositório
[https://github.com/LNeto82/agroerp](https://github.com/LNeto82/agroerp)