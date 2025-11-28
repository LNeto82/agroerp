import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, AppBar, Toolbar, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton, Tooltip, Tabs, Tab, Card, CardContent, Snackbar, Alert, InputAdornment, Box, Divider, Avatar
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';

function App() {
  // --- ESTADOS DE SESSÃO ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuarioLogado, setUsuarioLogado] = useState(localStorage.getItem('usuario'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role')); 
  
  const [loginForm, setLoginForm] = useState({ login: '', senha: '' });

  // --- ESTADOS DO SISTEMA ---
  // Se for ADMIN começa no Dashboard (0), se for VENDEDOR começa no Estoque (1)
  const [abaAtual, setAbaAtual] = useState(localStorage.getItem('role') === 'ADMIN' ? 0 : 1);
  const [produtos, setProdutos] = useState([]);
  const [historicoVendas, setHistoricoVendas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalVenda, setModalVenda] = useState(false);
  const [notificacao, setNotificacao] = useState({ open: false, msg: '', tipo: 'success' });

  const [novoProduto, setNovoProduto] = useState({ nome: '', partNumber: '', aplicacao: '', preco: '', estoque: '' });
  const [vendaAtual, setVendaAtual] = useState({ id: null, nome: '', quantidade: 1 });
  const [kpis, setKpis] = useState({ totalEstoque: 0, totalVendido: 0, itensBaixoEstoque: 0 });

  // Configura o Token no Axios sempre que ele mudar
  useEffect(() => {
    if(token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        carregarDados();
    }
  }, [token, abaAtual]);

  // --- FUNÇÕES DE SEGURANÇA ---
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', loginForm);
      
      // DESERIALIZAÇÃO DO DTO
      const { token, role, nome } = response.data; 

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', nome);
      localStorage.setItem('role', role);
      
      setToken(token);
      setUsuarioLogado(nome);
      setUserRole(role); 
      setAbaAtual(role === 'ADMIN' ? 0 : 1); // Redireciona conforme perfil

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      mostrarNotificacao(`Bem-vindo, ${nome}!`, "success");
    } catch (error) {
      mostrarNotificacao("Login falhou! Verifique usuário e senha.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUsuarioLogado(null);
    setUserRole(null);
    setLoginForm({login:'', senha:''});
    mostrarNotificacao("Logout realizado.", "info");
  };

  // --- UTILITÁRIOS ---
  const formatarMoeda = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (data) => new Date(data).toLocaleString('pt-BR');
  const mostrarNotificacao = (msg, tipo) => setNotificacao({ open: true, msg, tipo });

  // --- LÓGICA DE NEGÓCIO ---
  const carregarDados = async () => {
    if (!token) return;
    try {
      // Chama endpoints padrão. O JAVA decide o filtro de segurança.
      const [p, v] = await Promise.all([
        axios.get('http://localhost:8080/api/produtos'),
        axios.get('http://localhost:8080/api/vendas')
      ]);
      setProdutos(p.data);
      setHistoricoVendas(v.data);
      
      // Só calcula KPIs financeiros se for Admin
      if(userRole === 'ADMIN') calcularKpis(p.data, v.data); 
    } catch (e) {
        if(e.response?.status === 403) handleLogout(); // Token expirou
        else console.error("Erro ao carregar dados", e);
    }
  };

  const calcularKpis = (prods, vendas) => {
    const totalEstoque = prods.reduce((acc, p) => acc + (Number(p.preco) * Number(p.estoque)), 0);
    const totalVendido = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);
    const itensBaixoEstoque = prods.filter(p => p.estoque < 5).length;
    setKpis({ totalEstoque, totalVendido, itensBaixoEstoque });
  };

  // --- CRUD PRODUTOS ---
  const salvarProduto = async () => { 
    if (!novoProduto.nome || !novoProduto.preco) return mostrarNotificacao("Campos obrigatórios!", "warning");
    try {
      await axios.post('http://localhost:8080/api/produtos', novoProduto);
      setModalCadastro(false);
      carregarDados();
      setNovoProduto({ nome: '', partNumber: '', aplicacao: '', preco: '', estoque: '' });
      mostrarNotificacao("Produto cadastrado!", "success");
    } catch { mostrarNotificacao("Erro ao salvar.", "error"); }
  };

  const deletarProduto = async (id) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      try {
        await axios.delete(`http://localhost:8080/api/produtos/${id}`);
        carregarDados();
        mostrarNotificacao("Produto removido.", "info");
      } catch { mostrarNotificacao("Erro ao deletar.", "error"); }
    }
  };

  const confirmarVenda = async () => {
    try {
      await axios.put(`http://localhost:8080/api/produtos/${vendaAtual.id}/venda?quantidade=${vendaAtual.quantidade}`);
      setModalVenda(false);
      carregarDados();
      mostrarNotificacao("Venda registrada com sucesso!", "success");
    } catch (e) { 
        mostrarNotificacao(e.response?.data || "Erro na venda", "error"); 
    }
  };

  const exportarRelatorio = () => mostrarNotificacao("Exportando relatório para Excel...", "info");

  // Filtros e Gráficos
  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || p.partNumber.toLowerCase().includes(termoBusca.toLowerCase()));
  const dadosPizza = produtos.length > 0 ? [{ name: 'Normal', value: produtos.filter(p => p.estoque >= 5).length }, { name: 'Crítico', value: produtos.filter(p => p.estoque < 5).length }] : [];
  const CORES = ['#0088FE', '#FF8042'];

  // --- TELA DE LOGIN ---
  if (!token) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECEFF1' }}>
      <Paper elevation={6} style={{ padding: 40, width: 350, textAlign: 'center', borderRadius: 2 }}>
        <Avatar style={{ backgroundColor: '#102A43', margin: '0 auto 20px', width: 60, height: 60 }}><LockIcon fontSize="large"/></Avatar>
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>AgroERP Enterprise</Typography>
        <TextField label="Usuário" fullWidth margin="normal" variant="outlined" value={loginForm.login} onChange={e=>setLoginForm({...loginForm, login:e.target.value})}/>
        <TextField label="Senha" type="password" fullWidth margin="normal" variant="outlined" value={loginForm.senha} onChange={e=>setLoginForm({...loginForm, senha:e.target.value})}/>
        <Button variant="contained" fullWidth size="large" sx={{mt:3, py: 1.5, bgcolor:'#102A43'}} onClick={handleLogin}>ACESSAR SISTEMA</Button>
        <Typography variant="caption" display="block" sx={{mt:2, color: 'text.secondary'}}>Admin: admin/admin123 | Vendas: ana/123456</Typography>
      </Paper>
      <Snackbar open={notificacao.open} autoHideDuration={3000} onClose={() => setNotificacao({...notificacao, open:false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity={notificacao.tipo} variant="filled">{notificacao.msg}</Alert></Snackbar>
    </div>
  );

  // --- TELA DO SISTEMA ---
  return (
    <div style={{ backgroundColor: '#ECEFF1', minHeight: '100vh', paddingBottom: 50 }}>
      {/* CABEÇALHO */}
      <AppBar position="static" style={{ background: userRole === 'ADMIN' ? '#263238' : '#2E7D32' }}>
        <Toolbar>
          <AgricultureIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>AgroERP <span style={{fontSize:12, opacity:0.8}}>| {userRole}</span></Typography>
          <Chip icon={<PersonIcon style={{color:'white'}}/>} label={usuarioLogado} variant="outlined" sx={{color:'white', borderColor:'rgba(255,255,255,0.3)', mr:2}} />
          <IconButton color="inherit" onClick={handleLogout}><LogoutIcon/></IconButton>
        </Toolbar>
        <Tabs value={abaAtual} onChange={(e, v) => setAbaAtual(v)} textColor="inherit" indicatorColor="secondary" centered>
          {userRole === 'ADMIN' && <Tab icon={<DashboardIcon/>} label="Dashboard Financeiro" />}
          <Tab icon={<InventoryIcon/>} label="Estoque" />
          <Tab icon={<AssessmentIcon/>} label="Vendas" />
        </Tabs>
      </AppBar>

      <Container maxWidth="xl" style={{ marginTop: '25px' }}>
        
        {/* === ABA 0: DASHBOARD (ADMIN) === */}
        {abaAtual === 0 && userRole === 'ADMIN' && (
          <Grid container spacing={3}>
            {/* CARDS */}
            {[ {t:'Estoque Total', v:formatarMoeda(kpis.totalEstoque), c:'#102A43'}, {t:'Vendas Totais', v:formatarMoeda(kpis.totalVendido), c:'#2E7D32'}, {t:'Alerta Estoque', v:kpis.itensBaixoEstoque, c:kpis.itensBaixoEstoque>0?'#C62828':'#0277BD'} ].map((c,i)=>(
              <Grid item xs={12} sm={4} key={i}><Card sx={{bgcolor:c.c, color:'#fff'}}><CardContent><Typography variant="body2">{c.t}</Typography><Typography variant="h4">{c.v}</Typography></CardContent></Card></Grid>
            ))}
            {/* GRÁFICOS */}
            <Grid item xs={12} md={8}>
              <Paper sx={{p:3}}>
                <Typography variant="h6" color="primary" gutterBottom>Curva ABC de Estoque</Typography>
                <Divider sx={{mb:2}}/>
                <div style={{width:'100%', height:350}}>
                    <ResponsiveContainer><BarChart data={produtos.slice(0,15)}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="nome" tick={{fontSize:10}} interval={0}/><YAxis/><RechartsTooltip/><Bar dataKey="estoque" fill="#102A43" name="Qtd"/></BarChart></ResponsiveContainer>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{p:3}}>
                <Typography variant="h6" color="primary" align="center" gutterBottom>Saúde do Estoque</Typography>
                <Divider sx={{mb:2}}/>
                <div style={{width:'100%', height:350}}>
                    <ResponsiveContainer><PieChart><Pie data={dadosPizza} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>{dadosPizza.map((e,i)=><Cell key={i} fill={CORES[i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
                </div>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* === ABA 1: ESTOQUE (TODOS) === */}
        {(abaAtual === 1 || (abaAtual === 0 && userRole !== 'ADMIN')) && (
          <Paper sx={{p:2}}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <TextField size="small" placeholder="Buscar Peça, Código ou Aplicação..." value={termoBusca} onChange={e=>setTermoBusca(e.target.value)} InputProps={{startAdornment:<SearchIcon/>}} sx={{width: 400}}/>
              {userRole === 'ADMIN' && <Button variant="contained" startIcon={<AddCircleIcon/>} sx={{bgcolor:'#102A43'}} onClick={()=>setModalCadastro(true)}>Novo Item</Button>}
            </Box>
            <TableContainer sx={{maxHeight:'70vh'}}><Table size="small" stickyHeader><TableHead sx={{ bgcolor: '#ECEFF1' }}><TableRow><TableCell>ID</TableCell><TableCell>Peça</TableCell><TableCell>PN</TableCell><TableCell>Preço</TableCell><TableCell>Estoque</TableCell><TableCell>Ações</TableCell></TableRow></TableHead><TableBody>{produtosFiltrados.map(p=>(<TableRow key={p.id} hover><TableCell>{p.id}</TableCell><TableCell>{p.nome}</TableCell><TableCell>{p.partNumber}</TableCell><TableCell style={{fontWeight:'bold', color:'green'}}>{formatarMoeda(p.preco)}</TableCell><TableCell><Chip label={p.estoque} color={p.estoque>5?"default":"error"} size="small"/></TableCell><TableCell><IconButton size="small" color="primary" onClick={()=>{setVendaAtual({id:p.id, nome:p.nome, quantidade:1}); setModalVenda(true);}}><ShoppingCartIcon/></IconButton>{userRole === 'ADMIN' && <IconButton size="small" color="error" onClick={()=>deletarProduto(p.id)}><DeleteIcon/></IconButton>}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          </Paper>
        )}

        {/* === ABA 2: VENDAS (TODOS - FILTRADO PELO JAVA) === */}
        {abaAtual === 2 && (
          <Paper sx={{p:2}}>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary">Histórico de Vendas</Typography>
                <Button variant="outlined" startIcon={<DownloadIcon/>} onClick={exportarRelatorio}>Exportar</Button>
             </Box>
             <TableContainer sx={{maxHeight:'70vh'}}>
              <Table size="small" stickyHeader>
                <TableHead sx={{bgcolor: userRole === 'ADMIN' ? '#102A43' : '#2E7D32'}}> 
                  <TableRow>
                    <TableCell sx={{color:'#fff', fontWeight:'bold'}}>DATA</TableCell>
                    <TableCell sx={{color:'#fff', fontWeight:'bold'}}>VENDEDOR</TableCell>
                    <TableCell sx={{color:'#fff', fontWeight:'bold'}}>PRODUTO</TableCell>
                    <TableCell sx={{color:'#fff', fontWeight:'bold'}}>QTD</TableCell>
                    <TableCell sx={{color:'#fff', fontWeight:'bold'}}>TOTAL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicoVendas.map(v=>(
                    <TableRow key={v.id} hover>
                      <TableCell>{formatarData(v.dataVenda)}</TableCell>
                      <TableCell style={{fontWeight:'bold', color: '#555'}}>{v.nomeVendedor}</TableCell>
                      <TableCell>{v.nomePeca}</TableCell>
                      <TableCell>{v.quantidade}</TableCell>
                      <TableCell style={{fontWeight:'bold', color:'#2E7D32'}}>{formatarMoeda(v.valorTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* MODAIS */}
        <Dialog open={modalCadastro} onClose={()=>setModalCadastro(false)} fullWidth><DialogTitle>Nova Peça</DialogTitle><DialogContent><Grid container spacing={2} sx={{mt:1}}><Grid item xs={12}><TextField label="Nome" fullWidth onChange={e=>setNovoProduto({...novoProduto, nome:e.target.value})}/></Grid><Grid item xs={6}><TextField label="PN" fullWidth onChange={e=>setNovoProduto({...novoProduto, partNumber:e.target.value})}/></Grid><Grid item xs={6}><TextField label="Aplicação" fullWidth onChange={e=>setNovoProduto({...novoProduto, aplicacao:e.target.value})}/></Grid><Grid item xs={6}><TextField label="Preço" type="number" fullWidth onChange={e=>setNovoProduto({...novoProduto, preco:e.target.value})}/></Grid><Grid item xs={6}><TextField label="Estoque" type="number" fullWidth onChange={e=>setNovoProduto({...novoProduto, estoque:e.target.value})}/></Grid></Grid></DialogContent><DialogActions><Button onClick={()=>setModalCadastro(false)}>Cancelar</Button><Button onClick={salvarProduto} variant="contained">Salvar</Button></DialogActions></Dialog>
        <Dialog open={modalVenda} onClose={()=>setModalVenda(false)}><DialogTitle>Vender: {vendaAtual.nome}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label="Qtd" type="number" fullWidth value={vendaAtual.quantidade} onChange={e=>setVendaAtual({...vendaAtual, quantidade:e.target.value})}/></DialogContent><DialogActions><Button onClick={()=>setModalVenda(false)}>Cancelar</Button><Button onClick={confirmarVenda} variant="contained" color="success">Confirmar</Button></DialogActions></Dialog>
        <Snackbar open={notificacao.open} autoHideDuration={3000} onClose={()=>setNotificacao({...notificacao, open:false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity={notificacao.tipo} variant="filled">{notificacao.msg}</Alert></Snackbar>
      </Container>
    </div>
  );
}

export default App;