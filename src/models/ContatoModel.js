const mongoose = require('mongoose');
const validator = require('validator');

const contatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: false, default: '' },
  email: { type: String, required: false, default: '' },
  telefone: { type: String, required: false, default: '' },
  criadoEm: { type: Date, default: Date.now },
  
});

const ContatoModel = mongoose.model('contato', contatoSchema);

function Contato(body) {
  this.body = body;
  this.erros = [];
  this.contato = null;
}



Contato.prototype.register = async function() {
  this.valida();
  if(this.erros.length > 0) return;
  this.contato = await ContatoModel.create(this.body);
};

Contato.prototype.valida = function() {
  this.cleanUp();
  // validação
  // email precisa ser valida
  if(this.body.email && !validator.isEmail(this.body.email)) this.erros.push('E-mail inválido.');
  if(!this.body.nome) this.erros.push('Nome é um compo obrigatório.');
  if(!this.body.email && !this.body.telefone) this.erros.push('Pelo menos um contato deve ser preenchido: email ou telefone.')
  
}

Contato.prototype.cleanUp = function() {
  for(let key in this.body) {
    if(typeof this.body[key] !== 'string'){
      this.body[key] = '';
    }
  }

  this.body = {
    nome: this.body.nome,
    sobrenome: this.body.sobrenome,
    email: this.body.email,
    telefone: this.body.telefone,
  };
}

Contato.prototype.edit = async function(id) {
  if(typeof id !== 'string') return;
  this.valida();
  if(this.erros.length > 0) return;
  this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true} ); // {new: true} retorna os dados atualizados
}

// Métodos estáticos

Contato.buscaPorId = async function(id) {
  if(typeof id !== 'string') return;
  const contato = await ContatoModel.findById(id);
  return contato;
}

Contato.buscaContatos = async function(id) {
  
  const contatos = await ContatoModel.find().sort({ criadoEm: -1 }); // ordem decrescente
  return contatos;
}

Contato.delete = async function(id) {
  if(typeof id !== 'string') return;
  const contato = await ContatoModel.findOneAndDelete({_id: id}); // ordem decrescente
  return contato;
}


module.exports = Contato;