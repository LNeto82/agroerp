package com.agroerp.demobackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agroerp.demobackend.dto.ProdutoDTO;
import com.agroerp.demobackend.dto.VendaDTO;
import com.agroerp.demobackend.service.ProdutoService;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class ProdutoController {

    @Autowired
    private ProdutoService service;

    @GetMapping("/produtos")
    public List<ProdutoDTO> listarProdutos() {
        return service.listarTodos();
    }

    // Agora retorna VendaDTO (com nome do vendedor)
    @GetMapping("/vendas")
    public List<VendaDTO> listarVendas() {
        return service.listarVendas();
    }

    @PostMapping("/produtos")
    public ResponseEntity<?> salvarProduto(@RequestBody ProdutoDTO dto) {
        try {
            return ResponseEntity.ok(service.salvar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/produtos/{id}")
    public void deletarProduto(@PathVariable Long id) {
        service.deletar(id);
    }

    @PutMapping("/produtos/{id}/venda")
    public ResponseEntity<?> realizarVenda(@PathVariable Long id, @RequestParam Integer quantidade) {
        try {
            return ResponseEntity.ok(service.realizarVenda(id, quantidade));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}