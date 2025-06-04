export type RootStackParamList = {
  Tarefa: { lembrete?: Lembrete };
  Login: undefined;
  Cadastro: undefined;
  Configuracao: undefined;
  MeuPerfil: undefined;
  EncerrarConta: undefined;
  EncerramentoConta: undefined;
  InformacaoConta: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined;
  AdicionarMedicamento: undefined;
  Perfil: undefined;
};

export type Lembrete = {
  titulo: string;
  data: string;
  cor: string;
  icone: string;
  concluido: boolean;
};