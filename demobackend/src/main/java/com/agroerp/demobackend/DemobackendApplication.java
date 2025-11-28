package com.agroerp.demobackend;

import com.agroerp.demobackend.dto.ProdutoDTO;
import com.agroerp.demobackend.model.Produto;
import com.agroerp.demobackend.model.Usuario;
import com.agroerp.demobackend.model.Venda;
import com.agroerp.demobackend.repository.ProdutoRepository;
import com.agroerp.demobackend.repository.UsuarioRepository;
import com.agroerp.demobackend.repository.VendaRepository;
import com.agroerp.demobackend.service.ProdutoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@SpringBootApplication
public class DemobackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemobackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(ProdutoRepository produtoRepo, 
                                   VendaRepository vendaRepo, 
                                   UsuarioRepository usuarioRepo, 
                                   ProdutoService service,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println(">>> 1. LIMPANDO O BANCO DE DADOS... <<<");
            vendaRepo.deleteAll();
            produtoRepo.deleteAll();
            usuarioRepo.deleteAll();

            System.out.println(">>> 2. CONTRATANDO FUNCIONÁRIOS... <<<");
            List<Usuario> equipeVendas = new ArrayList<>();
            List<Usuario> equipeGerencia = new ArrayList<>();

            // --- CRIANDO A CHEFIA (GERENTES) ---
            // Admin Principal
            Usuario admin = criarUsuario("Carlos CEO", "admin", "admin123", "ADMIN", passwordEncoder, usuarioRepo);
            equipeGerencia.add(admin);

            // +2 Gerentes Extras
            for (int i = 1; i <= 2; i++) {
                Usuario g = criarUsuario("Gerente Regional " + i, "gerente" + i, "123456", "ADMIN", passwordEncoder, usuarioRepo);
                equipeGerencia.add(g);
            }

            // --- CRIANDO O CHÃO DE FÁBRICA (VENDEDORES) ---
            // Ana (Vendedora Principal)
            Usuario ana = criarUsuario("Ana Vendas", "ana", "123456", "VENDEDOR", passwordEncoder, usuarioRepo);
            equipeVendas.add(ana);

            // +10 Vendedores Extras
            for (int i = 1; i <= 10; i++) {
                Usuario v = criarUsuario("Vendedor " + i, "vendedor" + i, "123456", "VENDEDOR", passwordEncoder, usuarioRepo);
                equipeVendas.add(v);
            }

            System.out.println(">>> 3. FABRICANDO 500 PEÇAS... <<<");
            List<Produto> savedProducts = new ArrayList<>();
            Random random = new Random();
            List<String> nomes = Arrays.asList("Filtro", "Correia", "Bico", "Pistão", "Disco", "Rolamento", "Bomba", "Alternador", "Motor", "Farol");
            List<String> marcas = Arrays.asList("John Deere", "New Holland", "Valtra", "Case", "Jacto", "Massey Ferguson");
            List<String> aplicacoes = Arrays.asList("Trator 7230J", "Colheitadeira S680", "Pulverizador Uniport", "Trator T7", "Plantadeira 2100");

            for (int i = 0; i < 500; i++) {
                ProdutoDTO dto = new ProdutoDTO(
                    null, 
                    nomes.get(random.nextInt(nomes.size())) + " " + marcas.get(random.nextInt(marcas.size())),
                    "PN-" + (1000 + i) + (char)(random.nextInt(26) + 'A'), 
                    aplicacoes.get(random.nextInt(aplicacoes.size())),
                    BigDecimal.valueOf(50 + (1500 * random.nextDouble())), 
                    random.nextInt(200) + 50
                );
                
                Produto p = new Produto();
                p.setNome(dto.nome()); p.setPartNumber(dto.partNumber()); 
                p.setAplicacao(dto.aplicacao()); p.setPreco(dto.preco()); 
                p.setEstoque(dto.estoque());

                savedProducts.add(produtoRepo.save(p));
            }

            System.out.println(">>> 4. SIMULANDO 1.500 VENDAS ENTRE A EQUIPE... <<<");
            
            // Juntamos todos para o sorteio de quem vendeu
            List<Usuario> todosFuncionarios = new ArrayList<>();
            todosFuncionarios.addAll(equipeVendas);
            todosFuncionarios.addAll(equipeGerencia);

            for (int i = 0; i < 1500; i++) {
                Produto p = savedProducts.get(random.nextInt(savedProducts.size()));
                
                // Escolhe um funcionário aleatório para ser o dono da venda
                Usuario vendedorDaVez = todosFuncionarios.get(random.nextInt(todosFuncionarios.size()));
                
                int qtd = random.nextInt(4) + 1;

                Venda v = new Venda();
                v.setNomePeca(p.getNome());
                v.setQuantidade(qtd);
                v.setValorTotal(p.getPreco().multiply(new BigDecimal(qtd)));
                v.setDataVenda(LocalDateTime.now().minusDays(random.nextInt(90)).minusHours(random.nextInt(24)));
                v.setVendedor(vendedorDaVez); // <--- AQUI ESTÁ A DISTRIBUIÇÃO
                
                vendaRepo.save(v);

                // Atualiza Estoque
                p.setEstoque(p.getEstoque() - qtd);
                produtoRepo.save(p);
            }

            System.out.println(">>> EMPRESA OPERACIONAL! EQUIPE CONTRATADA E VENDAS REGISTRADAS. <<<");
        };
    }

    // Método auxiliar para criar usuário rápido
    private Usuario criarUsuario(String nome, String login, String senha, String perfil, PasswordEncoder encoder, UsuarioRepository repo) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setLogin(login);
        u.setSenha(encoder.encode(senha));
        u.setPerfil(perfil);
        return repo.save(u);
    }
}