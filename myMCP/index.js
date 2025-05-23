import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "Claude Assistant",
    version: "1.0.0",
});

// Example function that demonstrates a simple capability
async function greet(name) {
    return `Hello ${name}! This is your MCP server.`;
}

// Weather function to get weather data for a city
async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=150f560365e788066057abf69735713b&units=metric`);
        const data = await response.json();
        
        if (data.cod === 200) {
            return `Current weather in ${city}:
Temperature: ${data.main.temp}°C
Feels like: ${data.main.feels_like}°C
Humidity: ${data.main.humidity}%
Weather: ${data.weather[0].description}`;
        } else {
            return `Unable to fetch weather data for ${city}. Error: ${data.message}`;
        }
    } catch (error) {
        return `Error fetching weather data: ${error.message}`;
    }
}

// Register the tools with the server
server.tool("greet", {
    name: z.string().describe("The name of the person to greet")
},
    async ({ name }) => {
        const greeting = await greet(name);
        return { 
            content: [{ 
                type: 'text', 
                text: greeting 
            }] 
        };
    }
);

server.tool("weather", {
    city: z.string().describe("The name of the city to get weather for")
},
    async ({ city }) => {
        const weatherInfo = await getWeather(city);
        return {
            content: [{
                type: 'text',
                text: weatherInfo
            }]
        };
    }
);

async function init() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

init();