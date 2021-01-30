const modalContainer = document.querySelector('[data-modal="modal"]');
const openModal = document.querySelector('[data-modal="open"]');
const closeModal = document.querySelector('[data-modal="close"]');

function showModal() {
    modalContainer.classList.toggle('active');
}

openModal.addEventListener('click', showModal);
closeModal.addEventListener('click', showModal);

// salvar e pegar os dados no localStorage
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}

// Objeto com as funções responsáveis por somar entradas, saidas e calcular o total
const Transaction = {
    // todas as transações
    all: Storage.get(),
    // metodo que vai adicionar uma nova transação
    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },
    // função que vai remover as transações
    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
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
        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index);
        tr.dataset.index = index;
        // colocando no html a tr
        DOM.transactionsContainer.appendChild(tr);
    },
    // função que vai criar o html das transações
    innerHTMLTransaction(transaction,index) {
        // verificando qual class sera adicionada a transação atual
        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
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
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100;
        return value; 
    },
    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },
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
    },
}

// pegando os dados do formulário
const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),
    // pegando os valores e colocando em um objeto
    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },
    validateFields() {
        const { description, amount, date} = this.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!");
        }
    },
    formatValues() {
        let { description, amount, date} = this.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction);
    },
    clearFields() {
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },
    submit(event) {
        event.preventDefault();
        try {
        // verificar se todas as informações foram preenchidas
        this.validateFields();
        // formatar os dados para salvar
        const transaction = this.formatValues();
        // salvar os valores
        this.saveTransaction(transaction);
        // limpar os campos do formulário
        this.clearFields();
        // fechar o modal
        showModal();
        } catch (error) {
            alert(error.message);
        }

    }
}

// função que inicia o funcionamento da aplicação
const App = {
    init() {
        Transaction.all.forEach((transaction,index) => {
            DOM.addTransaction(transaction,index);
        })
        
        DOM.updateBalance();
        Storage.set(Transaction.all)
    },
    reload() {
        // depois que uma nova transação for adicionada, antes de colocar na tela, é limpado todas as transações para depois adicionar novamente
        DOM.clearTransactions();
        App.init();
    }
}

App.init();