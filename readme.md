# 🎲 Guilda Gacha

Um bot de Discord que simula um sistema **gacha** para sua guilda, permitindo que membros rolem personagens, colecionem, participem de banners especiais e gerenciem seu inventário. Ideal para comunidades que querem se divertir com sorteios, coleções e eventos temáticos!

---

## 🚀 Tecnologias

- [Node.js](https://nodejs.org/) (JavaScript)
- [Discord.js](https://discord.js.org/) — integração com Discord
- [SQLite](https://www.sqlite.org/) — banco de dados local e leve
- [Prisma](https://www.prisma.io/) — ORM para manipulação do banco

---

## ⚙️ Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/pedroserodio1/guilda-gacha.git
   cd guilda-gacha
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Configure o bot**
   Crie um arquivo `.env` na raiz com:
   ```
   DISCORD_TOKEN=seu_token_aqui
   CLIENT_ID=id_do_bot
   GUILD_ID=id_da_guilda_para_testes
   ADMIN_SERVER_ID=id_do_servidor_admin
   MY_DISCORD_ID=seu_id_discord
   DATABASE_URL="file:./dev.db"
   ```

4. **Prepare o banco de dados**
   ```bash
   npx prisma migrate deploy
   ```

5. **Inicie o bot**
   - Modo desenvolvimento:
     ```bash
     npm run dev
     ```
   - Modo produção:
     ```bash
     npm start
     ```

---

## 🧩 Estrutura do Projeto

- `src/commands/` — Comandos do bot (slash commands)
- `src/database/` — Configuração e acesso ao banco de dados via Prisma
- `src/events/` — Listeners de eventos do Discord
- `src/utils/` — Funções utilitárias
- `src/banners/` — Definição dos banners e personagens disponíveis

---

## 🕹️ Comandos principais

- `/roll [banner]` — Rola um personagem do banner escolhido (ou do padrão se não especificar)
- `/inventory` — Mostra seu inventário de personagens
- `/banners` — Lista banners ativos e permite ver personagens de cada um
- `/grant-coins` — (admin) Concede moedas a um usuário
- `/adicionar-personagem` — (admin) Adiciona personagens via arquivo JSON

---

## 🛠️ Exemplos de uso

- **Rolar personagem:**  
  `/roll` ou `/roll banner=anime2024`
- **Ver inventário:**  
  `/inventory`
- **Listar banners:**  
  `/banners`
- **Adicionar personagem (admin):**  
  `/adicionar-personagem arquivo=personagens.json`
- **Conceder moedas (admin):**  
  `/grant-coins usuario=@fulano quantidade=100`

---

## 🔄 Como funciona

1. O usuário usa `/roll` para tentar a sorte em um banner.
2. O bot sorteia um personagem conforme raridade e probabilidade, descontando moedas do usuário.
3. O personagem é salvo no inventário do jogador.
4. O usuário pode consultar seu inventário com `/inventory` e ver banners ativos com `/banners`.
5. Admins podem adicionar personagens e conceder moedas.

---

## 📦 Scripts úteis

| Script                | Descrição                                 |
|-----------------------|-------------------------------------------|
| `npm run dev`         | Roda em modo desenvolvimento (nodemon)    |
| `npm start`           | Roda em modo produção                     |
| `npx prisma migrate`  | Executa migrações do banco                |
| `npx prisma studio`   | Interface gráfica do banco SQLite         |

---

## 🧪 Testes

> **Ainda não implementado.**  
> Sinta-se à vontade para contribuir com testes unitários e de integração!

---

## 🐞 Suporte e problemas

- Encontrou um bug? Abra uma [issue](https://github.com/pedroserodio1/guilda-gacha/issues) com detalhes, prints e logs.
- Sugestões de comandos, banners ou personagens são bem-vindas!

---

## 🔒 Segurança

- **Nunca compartilhe seu `DISCORD_TOKEN` publicamente!**
- Recomenda-se rodar o bot em um servidor separado para testes antes de usar em produção.

---

## 🌐 Internacionalização

> Atualmente apenas em português.  
> Contribuições para outros idiomas são bem-vindas!

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Envie para o repositório remoto (`git push origin minha-feature`)
5. Abra um Pull Request 🎉

---

## 📝 Licença

Projeto sob licença MIT. Sinta-se livre para usar, modificar e distribuir, mantendo os créditos.

---

## ✨ Futuras melhorias

- Sistema de eventos especiais com banners limitados
- Sistema de troca entre jogadores
- Forma de ganhar moedas interagindo
- Implementação de recompensas diárias
- Sistema para criação de banners personalizados por admins, utilizando o bot em um server especial

## 📬 Contato

Para dúvidas, sugestões ou contribuições, entre em contato comigo:
- Discord: `pedroserodio`
- GitHub: [pedroserodio1](https://github.com/pedroserodio1)
- LinkedIn: [Pedro Serôdio](https://www.linkedin.com/in/pedroserodio1/)
- Twitter: [@pedroserodio](https://twitter.com/pedroserodio)
- Instagram: [@pedroserodio](https://www.instagram.com/pedroserodio/)
- Email: serodiomg@gmail.com
````

