'use strict'; // indicate that code is executed in strict mode

$("[data-toggle=popover]").popover({html:true});

var classBrowser = angular.module('classBrowserApp', ['ngAnimate', 'ngRoute', 'utilities', 'ui.bootstrap', 'pascalprecht.translate'])

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {templateUrl: 'views/start.html'})
			.when('/browse', { templateUrl: 'views/browseData.html' })
			.when('/datatypes', { templateUrl: 'views/datatypes.html' })
			.when('/about', { templateUrl: 'views/about.html' })
			.when('/view', { templateUrl: 'views/view.html' })
			.otherwise({redirectTo: '/'});
	})

	.config(['$translateProvider', function ($translateProvider) {
		
		var enMessages = {
			PROPTYPE : 'Type',
			TYPICAL_PROPS : 'Typical Properties',
			TYPICAL_PROPS_HINT_PROP : 'Other properties typically used by entities using this property',
			TYPICAL_PROPS_HINT_CLASS : 'Other properties typically used by direct and indirect instances of this class',
			SEC_CLASSIFICATION : 'Classification',
			SEC_INSTANCES : {
				SEC_INSTANCES : 'Instances',
				DIRECT_INSTANCES : 'Direct instances',
				ALL_INSTANCES : 'All instances',
				ALL_INSTANCES_HINT : 'Total number of unique instances of this class and its {{subclassCount}} direct and indirect subclasses'
			},
			SEC_PROP_USE : 'Property Usage',
			SEC_WIKIMEDIA_PAGES : 'Wikimedia Categories and Portals'
		};
		var deMessages = {
			PROPTYPE : 'Typ',
			TYPICAL_PROPS : 'Typische Eigenschaften',
			TYPICAL_PROPS_HINT_PROP : 'Andere Eigenschaften, die oftmals von Entitäten verwendet werden, die diese Eigenschaft verwenden',
			TYPICAL_PROPS_HINT_CLASS : 'Andere Eigenschaften, die oftmals von direkten oder indirekten Instanzen dieser Klasse verwendet werden',
			SEC_CLASSIFICATION : 'Klassifikation',
			SEC_INSTANCES : {
				SEC_INSTANCES : 'Instanzen',
				DIRECT_INSTANCES : 'Direkte Instanzen',
				ALL_INSTANCES : 'Alle Instanzen'
			},
			SEC_PROP_USE : 'Verwendung der Eigenschaft',
			SEC_WIKIMEDIA_PAGES : 'Wikimedia-Kategorien und -Portale'
		};
		
		$translateProvider
			.translations('en', enMessages )
			.translations('de', deMessages )
			.fallbackLanguage('en')
			.preferredLanguage('en')
			.useSanitizeValueStrategy('escape');
	}])

	.factory('Arguments', function($http, $route, jsonData, util){
		var args = {}; 
		var statusStartValues = {
			entityType: "classes",
			activePage: 1,
			classesFilter: {
				label: "",
				instances: [0, 4000000],
				subclasses: [0, 200000]
			},
			propertiesFilter: {
				label: "",
				statements: [0, 20000000],
				qualifiers: [0, 100000],
				references: [0, 100000],
				datatypes: {id: 1, name: "Any property type"}

			}
		};

		var serializeDatatype = function(type){
			return type.id + ":" + type.name;
		}

		var deserializeDatatype = function(typeString){
			if (!typeString){
				return typeString;
			}
			var splits = typeString.split(":");
			return {id: splits[0], name: splits[1]};
		}

		var status = util.cloneObject(statusStartValues);
		return {
			refreshArgs: function(){
				args = {
					type: ($route.current.params.type) ? ($route.current.params.type) : status.entityType,
					activePage: ($route.current.params.activepage) ? parseInt(($route.current.params.activepage)) : status.activePage,
					classesFilter: {
						label:  ($route.current.params.classlabelfilter) ? ($route.current.params.classlabelfilter) : status.classesFilter.label,
						instances: [ ($route.current.params.instancesbegin) ? ($route.current.params.instancesbegin) : status.classesFilter.instances[0], ($route.current.params.instancesend) ? ($route.current.params.instancesend) : status.classesFilter.instances[1]],
						subclasses: [ ($route.current.params.instancesbegin) ? ($route.current.params.instancesbegin) : status.classesFilter.instances[0], ($route.current.params.subclassesend) ? ($route.current.params.subclassesend) : status.classesFilter.subclasses[1]],
					  },
					propertiesFilter: {
						label: ($route.current.params.propertylabelfilter) ? ($route.current.params.propertylabelfilter) : status.propertiesFilter.label,
						statements: [ ($route.current.params.statementsbegin) ? ($route.current.params.statementsbegin) : status.propertiesFilter.statements[0], ($route.current.params.statementsend) ? ($route.current.params.statementsend) : status.propertiesFilter.statements[1]],
						qualifiers: [ ($route.current.params.qualifiersbegin) ? ($route.current.params.qualifiersbegin) : status.propertiesFilter.qualifiers[0], ($route.current.params.qualifiersend) ? ($route.current.params.qualifiersend) : status.propertiesFilter.qualifiers[1]],
						references: [ ($route.current.params.referencesbegin) ? ($route.current.params.referencesbegin) : status.propertiesFilter.references[0], ($route.current.params.referencesend) ? ($route.current.params.referencesend) : status.propertiesFilter.references[1]],
						datatypes: ($route.current.params.datatypes) ? deserializeDatatype($route.current.params.datatypes) : status.propertiesFilter.datatypes
					  }

				}
				status.activePage = args.activePage;
				status.entityType = args.type;
				status.classesFilter = args.classesFilter;
				status.propertiesFilter = args.propertiesFilter;
			},
			getArgs: function(){
				return args;
			},
			getStatus: function(){
				return status;
			},
			getStatusStartValues:function(){
				return util.cloneObject(statusStartValues);
			},
			getUrl: function(){
				return location.origin + location.pathname + "#/browse" 
					+ "?activepage=" + status.activePage
					+ "&type=" + status.entityType
					+ "&classlabelfilter=" + status.classesFilter.label
					+ "&propertylabelfilter=" + status.propertiesFilter.label 
					+ "&instancesbegin=" + status.classesFilter.instances[0]
					+ "&instancesend=" + status.classesFilter.instances[1]
					+ "&subclassesbegin=" + status.classesFilter.subclasses[0]
					+ "&subclassesend=" + status.classesFilter.subclasses[1]
					+ "&statementsbegin=" + status.propertiesFilter.statements[0]
					+ "&statementsend=" + status.propertiesFilter.statements[1]
					+ "&qualifiersbegin=" + status.propertiesFilter.qualifiers[0]
					+ "&qualifiersend=" + status.propertiesFilter.qualifiers[1]
					+ "&referencesbegin=" + status.propertiesFilter.references[0]
					+ "&referencesend=" + status.propertiesFilter.references[1]
					+ "&datatypes=" + serializeDatatype(status.propertiesFilter.datatypes);
			}
		}
	})

	.factory('Properties', function($http, $route){
		var promise;
		var properties;

		var getData = function(id, key, defaultValue) {
			try {
				var result = properties[id][key];
				if (typeof result !== 'undefined' && result !== null) {
					return result;
				}
			} catch(e){
				// fall through
			}
			return defaultValue;
		}

		var getLabel = function(id) { return getData(id, 'l', null); }
		var getLabelOrId = function(id) { return getData(id, 'l', 'P' + id); }
		var getUrl = function(id) { return "#/view?id=P" + id; }

		var getQualifiers = function(id){ return getData(id, 'qs', {}); }

		var getStatementCount = function(id){ return getData(id, 's', 0); }

		if (!promise) {
			promise = $http.get("data/properties.json").then(function(response){
				properties = response.data;
				return {
					propertiesHeader: [["Label (ID)", "col-xs-5"], ["Datatype", "col-xs-1"], ["Uses in statements", "col-xs-2"], ["Uses in qualifiers", "col-xs-2"], ["Uses in references", "col-xs-2"]],
					getProperties: function(){ return properties; },
					hasEntity: function(id){ return (id in properties); },
					getLabel: getLabel,
					getLabelOrId: getLabelOrId,
					getItemCount: function(id){ return getData(id, 'i', 0); },
					getDatatype: function(id){ return getData(id, 'd', null); },
					getStatementCount: getStatementCount,
					getQualifierCount: function(id){ return getData(id, 'q', 0); },
					getReferenceCount: function(id){ return getData(id, 'e', 0); },
					getRelatedProperties: function(id){ return getData(id, 'r', {}); },
					getQualifiers: getQualifiers,
					getMainUsageCount: getStatementCount,
					getUrl: getUrl,
					getUrlPattern: function(id){ return getData(id, 'u', null); },
					getClasses: function(id){ return getData(id, 'pc', []); }
				}
			});
		}
		return promise;
	})

	.factory('Classes', function($http, $route) {
		var promise;
		var classes; 

		var getData = function(id, key, defaultValue) {
			try {
				var result = classes[id][key];
				if (typeof result !== 'undefined' && result !== null) {
					return result;
				}
			} catch(e){
				// fall through
			}
			return defaultValue;
		};

		var getLabel = function(id){ return getData(id, 'l', null); };
		var getUrl = function(id) { return "#/view?id=Q" + id; };
		var getAllInstanceCount = function(id){ return getData(id, 'ai', 0); };

		if (!promise){
			promise = $http.get("data/classes.json").then(function(response){
				classes = response.data;
				return {
					classesHeader: [["Label (ID)", "col-xs-10"], ["Instances", "col-xs-1"], ["Subclasses", "col-xs-1"]],
					getClasses: function(){ return classes; },
					hasEntity: function(id){ return (id in classes); },
					getLabel: getLabel,
					getLabelOrId: function(id){ return getData(id, 'l', 'Q' + id); },
					getDirectInstanceCount: function(id){ return getData(id, 'i', 0); },
					getDirectSubclassCount: function(id){ return getData(id, 's', 0); },
					getAllInstanceCount: getAllInstanceCount,
					getAllSubclassCount: function(id){ return getData(id, 'as', 0); },
					getRelatedProperties: function(id){ return getData(id, 'r', {}); },
					getSuperClasses: function(id){ return getData(id, 'sc', []); },
					getMainUsageCount: getAllInstanceCount,
					getUrl: getUrl,
					getNonemptySubclasses: function(id){ return getData(id, 'sb', []); }
				}
			});
		}
		return promise;
	})
	
	.factory('statistics', function($http, $route) {
		var promise;
		var statistics; 

		if (!promise){
			promise = $http.get("data/statistics.json").then(function(response){
				statistics = response.data;
				return {
					getDumpDateStamp: function(){ return statistics['dumpDate']; },
					getDumpDateString: function(){
						var dateStamp = statistics['dumpDate'];
						return dateStamp.substring(0,4) + '-' + dateStamp.substring(4,6) + '-' + dateStamp.substring(6,8);
					}
				}
			});
		}
		return promise;
	})

	.filter('to_trusted', ['$sce', function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}])

	.directive('ngSlider', function(){
	    var SCALE_FACTOR = 1.005;
	    var scale = function(val){
	      if (val > 0) {
	      	return Math.ceil(Math.log(val) / Math.log(SCALE_FACTOR));
	      }
	      else {
	        return 0;
	      }
	    }
	    
	    var antiScale = function(val){
	      if (val > 0) {
	       	if ((Math.pow(SCALE_FACTOR, val) > 1) && (Math.pow(SCALE_FACTOR, val) < 1.5)){
	       		return 1;
	       	}
	        return Math.ceil(Math.pow(SCALE_FACTOR, val));
	      }else{
	        return 0;
	      }
	    }
	    function link(scope, element, attrs){
	      scope.$watchGroup(['startval', 'endval'], function(){
	        element.slider({
	          range: true,
	          min: scale(parseInt(scope.begin)),
	          max: scale(parseInt(scope.end)),
	          values: [ scale(scope.startval), scale(scope.endval) ],
	          slide: function( event, ui ) {
	            scope.$parent.slider[parseInt(scope.index)].startVal = antiScale(ui.values[0]);
	            scope.$parent.slider[parseInt(scope.index)].endVal = Math.min(antiScale(ui.values[1]), scope.end);
	            scope.$parent.updateStatus();
	            scope.$apply();
	          }
	        });
	      });
	    }
	    
	    return {
	      scope:{
	        begin: '=begin',
	        end: '=end',
	        index: '=index', // TODO and startVal and endVal
	        startval: '=startval',
	        endval: '=endval'
	      },
	      link: link
	    };
	})

	.controller('TypeSelectorController', function($scope, Arguments){
		Arguments.refreshArgs();
		var args = Arguments.getArgs();
		switch (args.type) {
			case "classes":
				$scope.firstActive = "active";
				$scope.secondActive = "";
				break;
			case "properties":
				$scope.firstActive = "";
				$scope.secondActive = "active";
				break;
			default:
				console.log("type: " + args.type + " is unknown");
				$scope.firstActive = "active";
				$scope.secondActive = "";
		}
	});
