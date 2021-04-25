const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector ('.modal-overlay')
            .classList
            .add('active')
    },
    close (){
        //fechar o modal
        //remover a class active do modal
        document
            .querySelector ('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Storage = {
    get(){
        //como embaixo pegou um array e transformou em string, mas para pegar precisa transformar de novo
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //transformando em string pois no local storage se recebe string
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0;
        // pegar todas as transações
        //para cada transação
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if(transaction.amount > 0){
                 //somar a uma variáel e retornar a variável
                 income += transaction.amount;
            }
        })
        return income;
    },
    expenses() {
            let expense = 0;
            // pegar todas as transações
            //para cada transação
            Transaction.all.forEach(transaction => {
                //se ela for menor que zero
                if(transaction.amount < 0){
                     //somar a uma variáel e retornar a variável
                     expense += transaction.amount;
                }
            })
            return expense;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

//preciso pegar as minhas transações do meu objeto no js, e colocar no html

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(Transaction, index){
        console.log(Transaction)
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(Transaction, index)
        tr.dataset.index = index


        DOM.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(Transaction, index) {

        const CSSclass = Transaction.amount > 0 ? "income" : "expense" // ternário

        const amount = Utils.formatCurrency(Transaction.amount)

        const html = ` 
        <td class="description">${Transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${Transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
     
        `
        return html
    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
    
}

const Utils = {
    formatAmount(value){
        value = value * 100

        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    
    formatCurrency(value){
       const signal = Number(value) < 0 ? "-" : ""
       
       value = String(value).replace(/\D/g, "")

       value = Number(value) / 100

       value = value.toLocaleString("pt-BR", {
           style: "currency",
           currency:"BRL"
       })
       return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),    
    amount: document.querySelector('input#amount'), 
    date: document.querySelector('input#date'), 

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues()

        if(
            description.trim() === "" || //trim é para fazer limpeza de espaços vazios
            amount.trim() === "" ||
            date.trim() === ""){
                throw new Error("Por favor, preencha todos os campos")
            }

    },

    formatValues(){
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try{
            
        //verificar se todas as informações foram preenchidas
        Form.validateFields()
        const transaction = Form.formatValues()
        //formatar os dados para salvar
       // Form.formatData()
        // salvar
        Transaction.add(transaction)
        //apagar os dados do formulário
        Form.clearFields()
        Modal.close()

        } catch (error){
           alert(error.message) 
        }

    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => { // quando só tem um parametro na função da pra usar => em vez de escrever (funcion(transaction){})
            DOM.addTransaction(transaction, index)
        }) 
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

