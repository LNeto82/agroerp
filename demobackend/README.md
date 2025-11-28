AgroERP Enterprise - Sistema de Gestão Full Stack
Resumo do Projeto Desenvolvi um ERP Full Stack robusto para o agronegócio utilizando Java Spring Boot 3 no backend e React (Vite) no frontend. A arquitetura segue padrões Enterprise com camadas isoladas (Service/Controller/Repository), uso de DTOs para segurança de dados e persistência em MySQL. O sistema implementa segurança avançada com Spring Security e JWT, garantindo controle de acesso baseado em função (RBAC) para segregar a visão gerencial (Admin) da operacional (Vendedor), contando ainda com Dashboards interativos e KPIs financeiros.

Ferramentas e Extensões Utilizadas

Java 21 e Spring Boot 3.5: Escolhidos por serem o padrão de mercado para sistemas Enterprise, garantindo robustez, injeção de dependência eficiente e facilidade de configuração.

Spring Security e JWT: Utilizados para implementar autenticação stateless e proteção contra ataques, sendo o padrão ouro atual em APIs REST seguras.

MySQL e Spring Data JPA: Selecionados para garantir persistência relacional confiável e abstração de SQL complexo, como os filtros de vendas por ID de usuário.

React e Vite: Escolhidos pela performance superior e hot-reload instantâneo, ideais para construção de SPAs (Single Page Applications) rápidas.

Material UI (MUI): Utilizado para entregar um visual corporativo e limpo ("cara de sistema SAP") sem a necessidade de estilizar CSS do zero.

Recharts: Biblioteca leve escolhida para renderizar os gráficos de Curva ABC e Pizza no Dashboard gerencial.

Lombok: Ferramenta de produtividade essencial para reduzir a verbosidade do código Java (Getters/Setters automáticos).

Swagger (OpenAPI): Implementado para gerar o manual técnico da API automaticamente, facilitando o entendimento da arquitetura por outros desenvolvedores.

O Maior Desafio A parte que exigiu mais tempo e esforço técnico foi a implementação da Segurança e Segregação de Dados (RBAC). Configurar o Spring Security para aceitar o Login, gerar o Token JWT corretamente e, principalmente, filtrar os dados no Backend para que o Vendedor visse apenas as suas próprias vendas (sem quebrar a aplicação com loops infinitos ou erros de CORS) exigiu uma refatoração profunda da arquitetura para o uso correto de DTOs e Services.

Objetivo e Melhorias Futuras O objetivo principal foi criar um MVP (Produto Mínimo Viável) de um sistema de gestão corporativa que simulasse um cenário real de entrevista técnica de nível Sênior, demonstrando domínio sobre o ciclo completo de desenvolvimento. Como melhorias futuras, o projeto poderia receber Testes Unitários (JUnit no Java e Jest no React) para garantir estabilidade a longo prazo, Paginação no backend para lidar com milhares de registros de forma mais leve, Dockerização para deploy em nuvem e geração de relatórios oficiais em PDF.

Resultados Alcançados O resultado final é um sistema 100% funcional com CRUD de produtos e fluxo de vendas com baixa automática de estoque. A segurança está garantida com senhas criptografadas (BCrypt) e acesso via Token. O Dashboard apresenta gráficos em tempo real calculando patrimônio e faturamento, e o banco de dados conta com um script "Data Seeder" que popula o sistema com 500 produtos e centenas de vendas automaticamente ao iniciar.

Referências

Documentação oficial do Spring Boot

React Documentation e Material UI Component Library

JWT.io para validação de tokens e segurança