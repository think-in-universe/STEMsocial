import {set} from 'idb-keyval';

// No rendering
Template.tosmodal.rendered = function () { }

// Initialization of the modal
Template.tosmodal.init = function () {
  $('#tosok').click(function() { set('steemstem_storage',sessionStorage.getItem('tos')); });
}

