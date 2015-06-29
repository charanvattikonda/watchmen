!function(){"use strict";var e=angular.module("watchmenApp",["ui.router","angularSpinner","ngTable","angularMoment","angularMSTime","watchmenControllers","watchmenDirectives","watchmenFactories","ngResource"]);e.config(["$stateProvider","$locationProvider","$urlRouterProvider",function(e,t,r){t.html5Mode(!0),e.state("services",{url:"/services",templateUrl:"service-list.html",controller:"ServiceListCtrl"}).state("viewService",{url:"/services/:id/view",templateUrl:"service-detail.html",controller:"ServiceDetailCtrl"}).state("newService",{url:"/services/add",templateUrl:"service-edit.html",controller:"ServiceAddCtrl"}).state("editService",{url:"/services/:id/edit",templateUrl:"service-edit.html",controller:"ServiceEditCtrl"}),r.when("/","/services")}])}(),function(){"use strict";angular.module("watchmenFactories",[]);var e,t,r=angular.module("watchmenFactories");r.factory("Report",["$resource","$cacheFactory",function(t,r){e=r("Services"),setInterval(function(){e.removeAll()},3e4);var i=t("/api/report/services/:id",{id:"@id"},{get:{method:"GET",cache:e},query:{method:"GET",isArray:!0,cache:e}});return i.clearCache=function(){e&&e.removeAll()},i}]),r.factory("Service",["$resource",function(e){return e("/api/services/:id",{id:"@id"},{reset:{method:"POST",url:"/api/services/:id/reset"}})}]),r.factory("PingPlugins",["$resource","$cacheFactory",function(e,r){return t=r("PingPlugins"),e("/api/plugins/:id",{id:"@id"},{query:{method:"GET",isArray:!0,cache:t}})}])}(),function(){"use strict";var e=!0;angular.module("watchmenFactories").factory("ngTableUtils",["ngTableParams",function(t){function r(t){var r={sorting:{"status.last24Hours.uptime":"asc"}};return e&&window.localStorage&&window.localStorage.getItem(t)?JSON.parse(window.localStorage.getItem(t)):r}function i(e,i,n){return new t(r(e),{total:i[e].length,counts:[],getData:function(t,r){var a=i[e],s=r.sorting()?n("orderBy")(a,r.orderBy()):a;t.resolve(s),window.localStorage&&window.localStorage.setItem(e,JSON.stringify({sorting:r.sorting()}))}})}return{createngTableParams:i}}])}(),function(){"use strict";function e(e,t,r){for(var i=[],n=[],a=0;a<e.length;a++)i.push([e[a][t]]),n.push(Math.round([e[a][r]]));return{time:i,data:n}}function t(e){return c3.generate({size:e.size,bindto:e.id,legend:{show:!1},data:{x:"x",columns:e.columns,types:{Latency:"area"},colors:{Latency:"green"}},axis:{y:{max:isNaN(e.max)?0:e.max,tick:{values:[200,500,1e3,2e3,3e3,4e3,5e3,7e3,1e4,15e3,2e4,3e4]}},x:{type:"timeseries",tick:{format:e.x_format||"%H:%M"}}},grid:e.grid,regions:e.regions,tooltip:{format:{title:function(e){return moment(e).format("DD/MMM/YY HH:mm")+" ("+moment(e).fromNow()+")"},value:function(e,t,r){return"Outages"==r?moment.duration(e).humanize():e+" ms."}}}})}window.Charting=window.Charting||{};Charting.render=function(r){var i=e(r.latency,"t","l"),n=i.data,a=i.time;a.splice(0,0,"x"),n.splice(0,0,"Latency");var s=[];if(r.outages)for(var o=0;o<r.outages.length;o++){var c=r.outages[o];s.push({axis:"x",start:c.timestamp,end:c.timestamp+c.downtime,"class":"region-outage",opacity:1})}var l=[{axis:"y",start:r.threshold,"class":"region-latency-warning"}].concat(s);return t({size:r.size,id:r.id,x_format:r.x_format,columns:[a,n],grid:{y:{lines:[{value:r.threshold,text:"latency threshold","class":"threshold"}]}},regions:l,max:r.max})}}(),angular.module("watchmenControllers",[]),function(){"use strict";var e=angular.module("watchmenControllers");e.controller("ServiceAddCtrl",["$scope","$state","$filter","$stateParams","Service","Report",function(e,t,r,i,n,a){e.service=new n,e.editServiceTitle="New service",e.service.timeout=1e4,e.service.warningThreshold=5e3,e.service.interval=6e4,e.service.failureInterval=3e4,e.service.port=80,e.service.pingServiceName="http-head",e.save=function(){e.service.pingServiceOptions={},e.service.pingServiceOptions[e.service.pingServiceName]=e.selectedPingServiceOptions,e.service.$save(function(){a.clearCache(),t.go("services")},function(t){console.error(t),t&&t.data&&t.data.errors&&(e.serviceAddErrors=t.data.errors)})},e.cancel=function(){t.go("services")}}])}(),function(){"use strict";var e=angular.module("watchmenControllers");e.controller("ServiceDetailCtrl",["$scope","$filter","$stateParams","Report","ngTableUtils","usSpinnerService","$timeout",function(e,t,r,i,n,a,s){function o(){return{height:150,width:$(".details-page").width()}}function c(){a.spin("spinner-1"),e.loading=!0}function l(){a.stop("spinner-1"),e.loading=!1}function u(t){console.log(t),l();var r=t.statusText;t.data&&t.data.error&&(r=t.data.error),e.errorLoadingService=r}c(),e.showConfig=!1,e.isAdmin=window.isAdmin,e.services=i.query(function(){e.services.sort(function(e,t){return e.status.last24Hours.uptime-t.status.last24Hours.uptime})}),e.serviceDetails=i.get({id:r.id},function(t){l(),e.latestOutages=t.status.latestOutages;var r=t.status.lastHour.latency,i=t.status.last24Hours.latency,n=t.status.lastWeek.latency,a=_.max(r.list,function(e){return e.l}),c=_.max(i.list,function(e){return e.l}),u=_.max(n.list,function(e){return e.l}),d=_.max([a.l,c.l,u.l]),v=[];s(function(){var a=o();r.list.length>0&&(e.showLastHourChart=!0,v.push(Charting.render({threshold:t.service.warningThreshold,latency:r.list,outages:t.status.lastHour.outages,id:"#chart-last-hour",size:a,max:d}))),i.list.length>8&&(e.showLast24Chart=!0,v.push(Charting.render({threshold:t.service.warningThreshold,latency:i.list,outages:t.status.last24Hours.outages,id:"#chart-last-24-hours",size:a,max:d}))),n.list.length>1&&(e.showLastWeekChart=!0,v.push(Charting.render({threshold:t.service.warningThreshold,latency:n.list,outages:t.status.lastWeek.outages,id:"#chart-last-week",size:a,x_format:"%d/%m",max:d}))),$(window).resize(function(){for(var e=0;e<v.length;e++)v[e].resize(o())})},0)},u)}])}(),function(){"use strict";var e=angular.module("watchmenControllers");e.controller("ServiceEditCtrl",["$scope","$state","$filter","$stateParams","Service","Report","usSpinnerService",function(e,t,r,i,n,a,s){function o(){s.spin("spinner-1"),e.loading=!0}function c(){s.stop("spinner-1"),e.loading=!1}o(),e.editServiceTitle="Update service",e.service=n.get({id:i.id},function(){c()},function(e){console.error(e),401===e.status&&t.go("services"),c()}),e.save=function(){e.service.pingServiceOptions={},e.service.pingServiceOptions[e.service.pingServiceName]=e.selectedPingServiceOptions,e.service.$save(function(){a.clearCache(),t.go("services")},function(t){console.error(t),t&&t.data&&t.data.errors&&(e.serviceAddErrors=t.data.errors)})},e.cancel=function(){t.go("services")}}])}(),function(){"use strict";var e,t=1e4,r=angular.module("watchmenControllers");r.controller("ServiceListCtrl",["$scope","$filter","$timeout","Report","Service","usSpinnerService","ngTableUtils",function(r,i,n,a,s,o,c){function l(){n.cancel(e),e=n(function(){d(l,u)},t)}function u(e){r.errorLoadingServices="Error loading data from remote server",console.error(e),l()}function d(e,t){a.clearCache(),r.services=a.query(function(t){r[g]=t,r.tableParams.reload(),r.errorLoadingServices=null,v.loaded(),e()},t)}var v={loading:function(){o.spin("spinner-1"),r.loading=!0},loaded:function(){o.stop("spinner-1"),r.loading=!1}},g="tableServicesData";r[g]=[],r.tableParams=c.createngTableParams(g,r,i);var m=document.getElementById("filterRestrictedToMe");if(m&&window.localStorage){var f="true"===window.localStorage.getItem("filterRestrictedToMe");n(function(){m.checked=f,r.filterRestrictedToMe=f},0)}r.$watch("filterRestrictedToMe",function(e){window.localStorage&&window.localStorage.setItem("filterRestrictedToMe",e)}),v.loading(),r.serviceFilter=function(e){return r.filterRestrictedToMe&&!e.service.isRestricted?!1:e.service.name.indexOf(r.query||"")>-1},r["delete"]=function(e){confirm("Are you sure you want to delete this service and all its data?")&&s["delete"]({id:e},function(){d(function(){},function(){r.errorLoadingServices="Error loading data from remote server"})})},r.reset=function(e){confirm("Are you sure you want to reset this service's data?")&&s.reset({id:e},function(){d(function(){},function(){r.errorLoadingServices="Error loading data from remote server"})})},d(l,u)}])}(),angular.module("watchmenDirectives",[]);var watchmenDirectives=angular.module("watchmenDirectives");watchmenDirectives.directive("pingServiceOptions",["PingPlugins",function(e){return{restrict:"EA",templateUrl:"ping-service-options.html",scope:!1,link:function(t){function r(){for(var e=0;e<t.pingServices.length;e++)t.pingServices[e].name===t.service.pingServiceName&&(t.selectedPingServiceOptions=$.extend({},t.pingServices[e].options,(t.service.pingServiceOptions||{})[t.service.pingServiceName]))}t.pingServices=e.query(function(){t.$watch("service.pingServiceName",function(){r()})}),t.hasPingServiceOptions=function(){return!angular.equals({},t.selectedPingServiceOptions)}}}}]);