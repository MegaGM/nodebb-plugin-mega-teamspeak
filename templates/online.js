var Handlebars=require("handlebars");module.exports = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) { var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression; return "data.online.site = " + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.online : depth0)) != null ? stack1.site : stack1), depth0)) + "\n<br/>\ndata.online.siteAnons = " + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.online : depth0)) != null ? stack1.siteAnons : stack1), depth0)) + "\n<br/>\ndata.online.teamspeak = " + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.online : depth0)) != null ? stack1.teamspeak : stack1), depth0)) + "\n<br/>\ndata.online.teamspeakWO = " + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.online : depth0)) != null ? stack1.teamspeakWO : stack1), depth0)) + "\n<br/>\ndata.online.overall = " + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.online : depth0)) != null ? stack1.overall : stack1), depth0)) + "\n\n<br/>\n"; },"useData":true});