(function($){
  'use strict';

  var $endpointsLists = $('ul.endpoints');
  $endpointsLists.hide();

  $('.api-item-title').on('click', function(event) {
    var $apiItem = $(this).parent('.api-item').find('ul.endpoints');
    $endpointsLists.not($apiItem).hide();

    if ($apiItem.is(':visible')) {
      $apiItem.hide();
    } else {
      $apiItem.show();
    }
  });

}(jQuery));
