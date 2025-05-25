# 📱 lembreMed

> Aplicativo de lembretes de medicamentos.  

---

## 🚀 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) *(se estiver usando)*
- [TypeScript](https://www.typescriptlang.org/) *(opcional)*
- 
---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-projeto.git

# Acesse o diretório do projeto
cd seu-projeto

# Instale as dependências
npm install
# ou
yarn install

# Inicie o projeto
npx expo start
# ou, caso não use expo
npx react-native run-android

---

## 📁 Estrutura de Pastas

```bash
.
├── assets/              # Imagens, fontes e outros arquivos estáticos
├── components/          # Componentes reutilizáveis
├── screens/             # Telas do aplicativo
├── navigation/          # Configuração de navegação
├── services/            # Requisições à API, axios, etc
├── store/               # Redux ou Context API
├── utils/               # Funções auxiliares/utilitárias
├── App.tsx              # Componente principal
├── package.json
└── README.md

---

## ✅ Funcionalidades

O aplicativo oferece as seguintes funcionalidades:

### 👤 Autenticação
- Cadastro de novos usuários
- Login com e-mail e senha
- Recuperação de senha
- Manutenção da sessão logada (autenticação persistente)

### 🗂️ Gestão de Dados
- Criação, edição e exclusão de registros (ex: pacientes, consultas, tarefas, etc.)
- Listagem com filtros e busca
- Detalhamento de informações

### 🧭 Navegação
- Navegação entre telas com React Navigation
- Tabs inferiores, drawer ou stack navigation (dependendo do app)
- Redirecionamento de rotas baseado em autenticação

### 🔔 Notificações
- Notificações push (via Firebase ou OneSignal)
- Alertas locais para eventos importantes

### ⚙️ Integrações
- Consumo de API externa (ex: backend próprio, Firebase, etc.)
- Integração com localização, câmera, calendário ou outro recurso do dispositivo

### 💬 Feedback ao Usuário
- Toasts, modais e loaders para interações visuais
- Validações de formulário com mensagens claras

### 🎨 Interface Responsiva
- Layout adaptado para diferentes tamanhos de tela
- Design moderno com uso de bibliotecas como React Native Paper ou Styled Components
