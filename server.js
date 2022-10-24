// variaveis de ambiente que estão configurado no arquivo .env (ambiente de desenvolvimento que voce não quer publicar num repositorio )
require('dotenv').config(); 

// inicializou o express
const express = require('express'); 
const app = express();

// quem vai modelar a nossa base de dados e garantir que os dados salvos são realmente da forma que quer salvar
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // retorna um promisse, quando estiver conectado o app vai emitir um evento dizendo que já esta conectado
    console.log('Conectei a base da dados.');
    app.emit('Pronto');
  })
  .catch(e => console.log(e));

// para identificar um navegador de um cliente, vai salvar o cookie com id, toda vez que conectar com servidor e vai checar o id 
const session = require('express-session');

// as sessoes vai ser salvas dendro da base de dados, por padra são salvas na memoria, podendo ficar rapidamente sem memoria
const MongoStore = require('connect-mongo');

// são mensagens auto destrutivas, são salva em session
const flash = require('connect-flash');

// rotas da aplicação
const routes = require('./routes');
// para trabalhar com caminhos
const path = require('path');
// recomendação do pessoal do express, para deixar mais seguro
//const helmet = require('helmet');
// são tokens para os formularios para segurança, faz com que nenhum aplicativo/site externo consiga postar coisa para dentro da aplicação
const csrf = require('csurf');
// middlewares (funções executadas na rota)
const { middlewareGlobal, checkCsrfErro, csrfMiddleware } = require('./src/middlewares/middleware');

// para segurança
//app.use(helmet());

// pode postar formularios para denreo da nosso aplicação 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// aquivos estaticos que pode ser acessados diretamente ex: imagens css javascript
app.use(express.static(path.resolve(__dirname, 'public')));

// configuraçãode session
const sessionOptions = session({
  secret: 'Qualquer coisa',
  //store: new MongoStore({mongooseConnection: mongoose.connect}),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000* 60 * 60 * 24 * 7, // 7 dias que vai durar o cookie
    httpOnly: true 
  },
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING })
});
app.use(sessionOptions);
app.use(flash());

// são os arquivos que renderiza na tela
app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Nossos próprios middlewares
app.use(csrf());
app.use(middlewareGlobal);
app.use(checkCsrfErro);
app.use(csrfMiddleware);
app.use(routes);

app.on('Pronto', () => {
  app.listen(3000, () => {
    console.log('Acessar http://localhost:3000');
    console.log('Servidor executando na porta 3000');
  });
});
