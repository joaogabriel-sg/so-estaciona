class Parking {
  constructor(formParking, tableHeader, tableResults) {
    this.formParking = document.querySelector(formParking);
    this.tableHeader = document.querySelector(tableHeader);
    this.tableResults = document.querySelector(tableResults);
    this.formSubmited = this.formSubmited.bind(this);
  }

  addToTable(newHtml) {
    this.tableResults.innerHTML += newHtml;
  }

  deleteItem(idDeleted) {
    const items = JSON.parse(localStorage.getItem('vehicles'));

    const filteredItems = items.filter(({ id }) => id !== idDeleted);
    const itemDeleted = items.filter(({ id }) => id === idDeleted)[0];

    const minutesInParking = Math.floor((Date.now() - itemDeleted.entranceMilliseconds) / 1000 / 60);
    const valueToPay = minutesInParking >= 15 ? parseInt(minutesInParking / 15) * 4.25 : 3;

    const doYouWantToDelete = confirm(`O(A) proprietário(a) ${itemDeleted.owner} veio buscar o veículo após ${minutesInParking} minuto(s) e pagará um valor de R$ ${valueToPay.toFixed(2).replace('.', ',')}.`);

    if (doYouWantToDelete) {
      if (filteredItems.length === 0) this.tableHeader.innerHTML = '';
      localStorage.setItem('vehicles', JSON.stringify(filteredItems));
      this.renderLocalStorage();
    }
  }

  renderLocalStorage() {
    const items = JSON.parse(localStorage.getItem('vehicles'));
    const newHtml = items.reduce((acc, { id, owner, model, plate, entrance }) => {
      acc += `
        <tr>
          <td data-label="Proprietário">${owner}</td>
          <td data-label="Modelo">${model}</td>
          <td data-label="Placa">${plate}</td>
          <td data-label="Horas">${entrance}</td>
          <td><button class="btn-delete" onclick="parking.deleteItem(${id})">x</button></td>
        </tr>
      `
      return acc;
    }, '');
    
    this.tableResults.innerHTML = '';
    this.addToTable(newHtml);
  }

  defineCorrespondingDate() {
    const date = new Date();
    const hours = date.getHours() > 10 ? date.getHours() : '0' + date.getHours();
    const minutes = date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes();
    const entranceMilliseconds = Date.now(date);
    return { hours, minutes, entranceMilliseconds };
  }

  generateId(myStorage) {
    let newId = !!myStorage.length ? myStorage[myStorage.length - 1].id : 0; 
    return ++newId;
  }
  
  addToLocalStorage(owner, model, plate) {
    const myStorage = JSON.parse(localStorage.getItem('vehicles')) || [];
    const id = this.generateId(myStorage);

    const { hours, minutes, entranceMilliseconds } = this.defineCorrespondingDate()
    const entrance = `${hours}h:${minutes}min`;
    
    myStorage.push({ id, owner, model, plate, entrance, entranceMilliseconds });
    localStorage.setItem('vehicles', JSON.stringify(myStorage));
  }

  getInputsAndAdd() {
    const owner = document.querySelector('input[name="owner"]');
    const model = document.querySelector('input[name="model"]');
    const plate = document.querySelector('input[name="plate"]');
    
    this.addToLocalStorage(owner.value, model.value, plate.value);

    owner.value = '';
    model.value = '';
    plate.value = '';
  } 

  renderTableTitles() {
    this.tableHeader.innerHTML = `
      <th>Proprietário</th>
      <th>Modelo</th>
      <th>Placa</th>
      <th>Horas</th>
      <th>Deletar</th>
    `;
  }

  verifyInputs() {
    let verifier = true;
    this.inputs = this.formParking.querySelectorAll('input');
    this.inputs.forEach((input) => {
      if (input.value.length === 0) {
        verifier = false;
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    })
    return verifier;
  }

  formSubmited(e) {
    e.preventDefault();

    if (this.verifyInputs()) {
      this.renderTableTitles();
      this.getInputsAndAdd();
      this.renderLocalStorage();
    }
  }

  parseJSON(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  
  init() {
    if (this.formParking && this.tableResults) {
      this.formParking.addEventListener('submit', this.formSubmited);
      if (!!this.parseJSON(localStorage.getItem('vehicles'))) {
        this.renderTableTitles();
        this.renderLocalStorage();
      }
    }
    return this;
  }
}

const parking = new Parking('form.form-parking', 'table.results-table thead', 'table.results-table tbody');
parking.init();
