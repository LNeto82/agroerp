package com.agroerp.demobackend.service;

import com.agroerp.demobackend.dto.ProdutoDTO;
import com.agroerp.demobackend.dto.VendaDTO;
import com.agroerp.demobackend.model.Produto;
import com.agroerp.demobackend.model.Usuario;
import com.agroerp.demobackend.model.Venda;
import com.agroerp.demobackend.repository.ProdutoRepository;
import com.agroerp.demobackend.repository.UsuarioRepository;
import com.agroerp.demobackend.repository.VendaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired private ProdutoRepository produtoRepository;
    @Autowired private VendaRepository vendaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    // --- PRODUTOS ---
    public List<ProdutoDTO> listarTodos() {
        return produtoRepository.findAll().stream().map(this::toProdutoDTO).collect(Collectors.toList());
    }

    public ProdutoDTO salvar(ProdutoDTO dto) {
        if (dto.preco() == null || dto.preco().compareTo(BigDecimal.ZERO) < 0) 
            throw new IllegalArgumentException("Preço inválido.");

        Produto p = new Produto();
        if (dto.id() != null) p.setId(dto.id());
        p.setNome(dto.nome()); p.setPartNumber(dto.partNumber()); p.setAplicacao(dto.aplicacao());
        p.setPreco(dto.preco()); p.setEstoque(dto.estoque());

        return toProdutoDTO(produtoRepository.save(p));
    }

    public void deletar(Long id) {
        produtoRepository.deleteById(id);
    }

    // --- VENDAS (LÓGICA BLINDADA COM ID) ---
    public List<VendaDTO> listarVendas() {
        // 1. Pega login do contexto de segurança
        String loginUsuarioLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Busca o objeto usuário para saber ID e Perfil
        Usuario usuarioLogado = usuarioRepository.findByLogin(loginUsuarioLogado)
                .orElseThrow(() -> new RuntimeException("Erro: Usuário do token não existe no banco."));
        
        List<Venda> vendas;

        // 3. Aplica o filtro de segurança (RBAC)
        if ("ADMIN".equalsIgnoreCase(usuarioLogado.getPerfil())) {
            // ADMIN: Vê tudo (SELECT * FROM vendas)
            vendas = vendaRepository.findAll();
        } else {
            // VENDEDOR: Vê apenas as suas (SELECT * FROM vendas WHERE vendedor_id = X)
            // Usando ID é mais seguro que passar o objeto inteiro
            vendas = vendaRepository.findByVendedor_Id(usuarioLogado.getId()); 
        }

        return vendas.stream()
                .map(this::toVendaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProdutoDTO realizarVenda(Long id, Integer quantidade) throws Exception {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new Exception("Produto não encontrado!"));

        if (produto.getEstoque() < quantidade) {
            throw new Exception("Estoque insuficiente!");
        }

        String loginUsuarioLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario vendedor = usuarioRepository.findByLogin(loginUsuarioLogado)
                .orElseThrow(() -> new Exception("Vendedor inválido."));

        // Baixa de estoque
        produto.setEstoque(produto.getEstoque() - quantidade);
        produtoRepository.save(produto);

        // Registro da venda
        Venda venda = new Venda();
        venda.setDataVenda(LocalDateTime.now());
        venda.setNomePeca(produto.getNome());
        venda.setQuantidade(quantidade);
        venda.setValorTotal(produto.getPreco().multiply(new BigDecimal(quantidade)));
        venda.setVendedor(vendedor);
        
        vendaRepository.save(venda);

        return toProdutoDTO(produto);
    }

    // --- MAPPERS ---
    private ProdutoDTO toProdutoDTO(Produto p) {
        return new ProdutoDTO(p.getId(), p.getNome(), p.getPartNumber(), p.getAplicacao(), p.getPreco(), p.getEstoque());
    }

    private VendaDTO toVendaDTO(Venda v) {
        String nomeVendedor = (v.getVendedor() != null) ? v.getVendedor().getNome() : "Sistema";
        return new VendaDTO(v.getId(), v.getDataVenda(), v.getNomePeca(), v.getQuantidade(), v.getValorTotal(), nomeVendedor);
    }
}