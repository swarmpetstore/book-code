package org.packt.swarm.petstore.proxy;

import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandProperties;
import org.packt.swarm.petstore.pricing.api.Price;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@ApplicationScoped
public class PricingProxy {

    private final String targetPath = "http://pricing-service.petstore.svc:8080";

    public Price getPrice(String itemId){
        return new GetPriceCommand(itemId).execute().readEntity(Price.class);
    }

    private class GetPriceCommand extends HystrixCommand<Response> {

        private final String itemId;

        public GetPriceCommand(String itemId) {
            super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("pricing-service")));
            this.itemId = itemId;
        }

        @Override
        protected Response run() {
            Client client = ClientBuilder.newClient();
            WebTarget target = client.target(targetPath + "/price/" + itemId);
            return target.request(MediaType.APPLICATION_JSON).get();
        }
    }
}

