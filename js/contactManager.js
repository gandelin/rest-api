var BASE_URL = 'https://pacific-meadow-64112.herokuapp.com/data-api/';
var collection = 'gandelin';
var contacts = getDsContacts();
var contactsVisible = false;

$(document).ready(function() {
  if (contacts.length > 0) {
    updateContactTable();
    resetForm();
    togglePageVisibility();
  }
});

$("#cancel").click(function() {
  togglePageVisibility();
});

$("#addNewItem").on('click', addNewContact);
$('#contact-tbody').on('click', '.edit', editContact);
$('#contact-tbody').on('click', '.delete', deleteContact);

function resetForm() {
  $('#name').val("");
  $('#phone').val("");
}

function updateContactTable() {
  for (var i=0; i<contacts.length; i++) {
    console.log(contacts[i].name);
    console.log(contacts[i].phone);
  }
  var tbody = $("#contact-tbody");
  tbody.empty();
  contacts.forEach(function(contact) {
    var contactRow = createTableRow(contact);
    tbody.append(contactRow);
  });
}

function createTableRow(contact) {
  var tableRow = $('<tr data-id="' + contact.id + '">');
  var contactName = $('<td>').text(contact.name);
  tableRow.append(contactName);
  var contactPhone = $('<td>').text(contact.phone);
  tableRow.append(contactPhone);
  var td = $('<td>');
  var button = $('<td>').text
  var button = $('<button type="button" class="edit">');
  button.text("Edit");
  td.append(button);
  tableRow.append(td);
  td = $('<td>');
  button = $('<button type="button" class="delete">');
  button.text("Delete");
  td.append(button);
  tableRow.append(td);
  return tableRow;
}

function togglePageVisibility() {
  if (contactsVisible) {
    // hide contacts, show form
    $("#contactEntry").removeClass('hide');
    $("#contacts").addClass('hide');
  }
  else {
    // show contacts, hide form
    $("#contacts").removeClass('hide');
    $("#contactEntry").addClass('hide');
  }
  contactsVisible = !contactsVisible;
}

function addNewContact() {
  createOrEditContact();
}

function editContact(e) {
  var ix = getContactIndex(e);
  if (ix >= 0) {
    createOrEditContact(contacts[ix]);
  }
}

function getContactIndex(e) {
  var btn = e.target;
  var tr = $(btn).closest( 'tr' );
  var id = tr.attr( 'data-id' );
  var i, len;

  for ( i = 0, len = contacts.length; i < len; ++i ) {
    if ( contacts[ i ].id === id ) {
      return i;
    }
  }
  return -1;
}

function deleteContact(e) {
  var ix = getContactIndex(e);
  if (ix >= 0) {
    deleteDsContact(contacts(ix));
    contacts.splice(ix, 1);
    updateContactTable();
  }
}

function createOrEditContact(contact) {
  if (contact) {
    $('#name').val(contact.name);
    $('#phone').val(contact.phone);
  }
  else {
    $('#name').val('');
    $('#phone').val('');
  }
  
  $('#submit').one('click', createOrUpdateContact);
  
  togglePageVisibility();
  
  function createOrUpdateContact(evt) {
    evt.preventDefault();
    
    if (contact) {
      contact.name = $('#name').val();
      contact.phone = $('#phone').val();
      saveDsContact(contact);
    }
    else {
      // new contact
      var newContact = { id: (nextId++).toString(),
                       name: $('#name').val(),
                      phone: $('#phone').val()
      };
      contacts.push(newContact);
      saveDsContact(newContact);
    }
    updateContactTable();
    togglePageVisibility();
  }
}

// get whole datastore collection of contacts
function getDsContacts() {
  $.getJSON( BASE_URL + collection, function(data) {
    return JSON.parse(data);
  });
}

// delete contact from datastore
function deleteDsContact(contact) {
  if (contact.id) {
    clearReport();
    $.ajax(BASE_URL + collection + '/' + contact.id, {
      method: 'DELETE',
      success: reportResponse,
      error: reportAjaxError
    });
  }
}

// save (or update) contact to datastore
function saveDsContact(contact) {
  clearReport();
  if (contact.id) {
    // existing contact
    $.ajax( BASE_URL + collection + '/' + id,
    {
        method: 'PUT',
        data: contact,
        success: reportResponse,
        error: reportAjaxError
    });
  }
  else {
    // new contact
    $.ajax( BASE_URL + collection,
    {
        method: 'POST',
        data: contact,
        success: reportResponse,
        error: reportAjaxError
    } );
  }
}

function clearReport( ) {
    $('#response').empty( );
}

function reportResponse( response ) {
    $('#response').text( JSON.stringify( response, null, 4 ) );
}

function reportAjaxError( jqXHR, textStatus, errorThrown ) {
    var msg = 'AJAX error.\n' +
        'Status Code: ' + jqXHR.status + '\n' +
        'Status: ' + textStatus;
    if ( errorThrown ) {
        msg += '\n' + 'Error thrown: ' + errorThrown;
    }
    if ( jqXHR.responseText ) {
        msg += '\n' + 'Response text: ' + jqXHR.responseText;
    }
    $('#response').text( msg );
}
