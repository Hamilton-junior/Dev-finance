const modalContainer = document.querySelector('[data-modal="modal"]');
const openModal = document.querySelector('[data-modal="open"]');
const closeModal = document.querySelector('[data-modal="close"]');

function showModal() {
    modalContainer.classList.toggle('active');
}

openModal.addEventListener('click', showModal);
closeModal.addEventListener('click', showModal);

// Objeto que contem os dados de cada transação
const transactions = [
    {
    id:1,
    description: 'Luz',
    amount: -50000,
    date: '23/01/2021',
},
{
    id:2,
    description: 'Criação website',
    amount: 500000,
    date: '23/01/2021',
},
{
    id:3,
    description: 'Internet',
    amount: -20000,
    date: '23/01/2021',
},

]

// Objeto com as funções responsáveis por somar entradas, saidas e calcular o total
const Transaction = {
    // todas as transações
    all: transactions,
    // metodo que vai adicionar uma nova transação
    add(transaction) {
        Transaction.all.push(transaction);
    },
    incomes() {
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses() {
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    }, 
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Objeto que irá trabalhar com a dom
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    // função que irá colocar no html as transações
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        // pegando o retorno do metodo/função innerHTMLTransaction e colocando no html do tr criado
        tr.innerHTML = DOM.innerHTMLTransaction(transaction);
        // colocando no html a tr
        DOM.transactionsContainer.appendChild(tr);
    },
    // função que vai criar o html das transações
    innerHTMLTransaction(transaction) {
        // verificando qual class sera adicionada a transação atual
        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img src="./assets/minus.svg" alt="Remover transação">
            </td>
        `;

        return html;
    },
    // função que vai atualizar os valores
    updateBalance() {
        document.querySelector('[data-balance="income"]').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.querySelector('[data-balance="expense"]').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.querySelector('[data-balance="total"]').innerHTML = Utils.formatCurrency(Transaction.total());
    },
    // função que vai limpar as transações da tela
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    // função que vai adicionar uma formatação de moeda no valor da transação
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        // utilizando uma regex para retirar caractere especial do value
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        // fazendo a formatação para rel
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value;
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction) => {
            DOM.addTransaction(transaction);
        })
        
        DOM.updateBalance();
    },
    reload() {
        // depois que uma nova transação for adicionada, antes de colocar na tela, é limpado todas as transações para depois adicionar novamente
        DOM.clearTransactions();
        App.init();
    }
}

App.init();