# ✅ Teaser Tarefas - Gestor de Tarefas Colaborativo

Um aplicação web moderna e intuitiva para gestão de tarefas, construída com foco na colaboração em tempo real. O projeto evoluiu de um simples protótipo local para uma *Single Page Application (SPA)* totalmente funcional e online, permitindo que múltiplos utilizadores partilhem e façam a gestão da mesma lista de tarefas em simultâneo.

Todo o desenvolvimento foi guiado por uma **metodologia ágil**, onde o feedback do utilizador foi crucial para definir e refinar as funcionalidades, desde a conceção inicial até à integração com serviços na nuvem.

---

## ✨ Funcionalidades Principais

* ***Colaboração em Tempo Real***: Graças à integração com o **Firebase Firestore**, qualquer alteração (adicionar, editar, concluir ou eliminar uma tarefa) é refletida instantaneamente no ecrã de todos os utilizadores ligados.
* ***Gestão Completa de Tarefas***: Crie tarefas com título, descrição, data de vencimento, categoria e nível de prioridade (Alta, Média, Baixa).
* ***Visualização Semanal com Calendário***: Navegue facilmente pelas semanas e visualize os dias que têm tarefas pendentes.
* ***Filtro por Dia***: Clique num dia específico no calendário para focar apenas nas tarefas dessa data.
* ***Organização Clara***: As tarefas são automaticamente separadas em duas colunas: "A Fazer" e "Concluídas".
* ***Interface Moderna e Responsiva***: Design limpo em *Dark Mode*, construído para funcionar perfeitamente tanto em desktops como em telemóveis.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com tecnologias web modernas e eficientes, sem a necessidade de frameworks complexos.

* **HTML5**: Para a estrutura semântica da aplicação.
* **Tailwind CSS**: Uma framework CSS "utility-first" para a criação de um design moderno e totalmente responsivo.
* **JavaScript (ES6+)**: Responsável por toda a lógica da aplicação, manipulação do DOM e comunicação com o Firebase.
* **Firebase (Google)**: A espinha dorsal da funcionalidade online:
  * **Firestore Database**: Como base de dados NoSQL em tempo real para armazenar e sincronizar todas as tarefas.
  * **Authentication**: Para gerir utilizadores de forma anónima e segura.
* **Font Awesome**: Para os ícones utilizados na interface.
* **Google Fonts**: Para a tipografia (fonte "Inter").

---

## ⚙️ Como Executar o Projeto

Para alojar a sua própria versão do Teaser Tarefas, siga estes passos:

1.  **Crie um Projeto no Firebase**:
    * Aceda à [Consola do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
    * Adicione uma "Aplicação da Web" ao seu projeto para obter as chaves de configuração (`firebaseConfig`).

2.  **Configure os Serviços do Firebase**:
    * No menu **Build**, vá para **Authentication**, clique no separador "Sign-in method" e ative o fornecedor **"Anónimo"**.
    * No menu **Build**, vá para **Firestore Database**, clique em "Criar base de dados", escolha a localização e inicie em **"modo de teste"**.

3.  **Atualize o Código**:
    * Abra o ficheiro `script.js`.
    * Cole o objeto `firebaseConfig` que obteve no passo 1, substituindo o bloco de exemplo.

4.  **Publique na Web**:
    * Faça o upload dos três ficheiros (`index.html`, `style.css`, `script.js`) para um serviço de alojamento de sites estáticos, como [Netlify](https://www.netlify.com/), [Vercel](https://vercel.com/) ou [GitHub Pages](https://pages.github.com/).

---

## 🔮 Próximos Passos (Melhorias Futuras)

O Teaser Tarefas é uma base sólida que pode ser expandida com novas funcionalidades:

* **Contas de Utilizador**: Implementar login com Google/Email para que os utilizadores tenham as suas próprias listas de tarefas privadas.
* **Quadros Partilhados**: Permitir a criação de múltiplos quadros de tarefas que podem ser partilhados com equipas específicas através de convites.
* **Notificações**: Enviar alertas no navegador quando uma tarefa estiver próxima do vencimento.
* **Tarefas Recorrentes**: Adicionar a opção de criar tarefas que se repetem automaticamente (diariamente, semanalmente, etc.), como a nossa ideia original de "Estudar conversação".
* **Anexos e Comentários**: Permitir que os utilizadores adicionem ficheiros e comentários às tarefas.

---
