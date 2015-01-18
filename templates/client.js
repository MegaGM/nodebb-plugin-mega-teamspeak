var Handlebars = require("handlebars");module.exports = Handlebars.template({"1":function(depth0,helpers,partials,data) { return " ts-client-gray"; },"3":function(depth0,helpers,partials,data) { var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression; return " data-userlink=\"user/" + escapeExpression(((helper = (helper = helpers.userslug || (depth0 != null ? depth0.userslug : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"userslug","hash":{},"data":data}) : helper))) + "\""; },"5":function(depth0,helpers,partials,data) { var lambda=this.lambda, escapeExpression=this.escapeExpression; return " <div class=\"ts-prefix " + escapeExpression(lambda(depth0, depth0)) + "\">1&nbsp;</div>\r\n"; },"7":function(depth0,helpers,partials,data) { var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression; return " <div class=\"ts-client-info\" style=\"\r\n background: url( '" + escapeExpression(((helper = (helper = helpers.iconPath || (depth0 != null ? depth0.iconPath : depth0)) != null ? helper : helperMissing),(typeof helper=== functionType ? helper.call(depth0, {"name":"iconPath","hash":{},"data":data}) : helper))) + "countries/" + escapeExpression(((helper = (helper = helpers.client_country || (depth0 != null ? depth0.client_country : depth0)) != null ? helper : helperMissing),(typeof helper=== functionType ? helper.call(depth0, {"name":"client_country","hash":{},"data":data}) : helper))) + ".png' ) no-repeat center center;\r\n \">&nbsp;</div>\r\n"; },"9":function(depth0,helpers,partials,data,depths) { var stack1, buffer = ""; stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.client_servergroups : depth0), {"name":"each","hash":{},"fn":this.program(10, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } return buffer; },"10":function(depth0,helpers,partials,data,depths) { var lambda=this.lambda, escapeExpression=this.escapeExpression; return " <div class=\"ts-client-info\" style=\"\r\n background: url( '" + escapeExpression(lambda((depths[1] != null ? depths[1].iconPath : depths[1]), depth0)) + "servergroups/" + escapeExpression(lambda(depth0, depth0)) + ".png' ) no-repeat center center;\r\n \">&nbsp;</div>\r\n"; },"12":function(depth0,helpers,partials,data) { var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression; return " <div class=\"ts-client-info\" style=\"\r\n background: url( '" + escapeExpression(((helper = (helper = helpers.iconPath || (depth0 != null ? depth0.iconPath : depth0)) != null ? helper : helperMissing),(typeof helper=== functionType ? helper.call(depth0, {"name":"iconPath","hash":{},"data":data}) : helper))) + "channelgroups/" + escapeExpression(((helper = (helper = helpers.client_channel_group_id || (depth0 != null ? depth0.client_channel_group_id : depth0)) != null ? helper : helperMissing),(typeof helper=== functionType ? helper.call(depth0, {"name":"client_channel_group_id","hash":{},"data":data}) : helper))) + ".png' ) no-repeat center center;\r\n \">&nbsp;</div>\r\n"; },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,depths) { var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"ts-client"; stack1=helpers.unless.call(depth0, (depth0 != null ? depth0.userslug : depth0), {"name":"unless","hash":{},"fn":this.program(1, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } buffer += "\" id=\"ts-client-" + escapeExpression(((helper = (helper = helpers.clid || (depth0 != null ? depth0.clid : depth0)) != null ? helper : helperMissing),(typeof helper=== functionType ? helper.call(depth0, {"name":"clid","hash":{},"data":data}) : helper))) + "\""; stack1=helpers['if'].call(depth0, (depth0 != null ? depth0.userslug : depth0), {"name":"if","hash":{},"fn":this.program(3, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } buffer += ">\r\n"; stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.prefix : depth0), {"name":"each","hash":{},"fn":this.program(5, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } buffer += "\r\n <div class=\"ts-client-flag " + escapeExpression(((helper = (helper = helpers.flag || (depth0 != null ? depth0.flag : depth0)) != null ? helper : helperMissing),(typeof helper=== functionType ? helper.call(depth0, {"name":"flag","hash":{},"data":data}) : helper))) + "\">&nbsp;</div>\r\n\r\n <div class=\"ts-client-header\">\r\n " + escapeExpression(((helper = (helper = helpers.nick || (depth0 != null ? depth0.nick : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"nick","hash":{},"data":data}) : helper))) + "\r\n </div>\r\n\r\n"; stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.client_country : depth0), {"name":"if","hash":{},"fn":this.program(7, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } buffer += "\r\n"; stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.client_servergroups : depth0), {"name":"if","hash":{},"fn":this.program(9, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } buffer += "\r\n"; stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.client_channel_group_id : depth0), {"name":"if","hash":{},"fn":this.program(12, data, depths),"inverse":this.noop,"data":data}); if (stack1 != null) { buffer += stack1; } return buffer + "</div>\r\n"; },"useData":true,"useDepths":true});