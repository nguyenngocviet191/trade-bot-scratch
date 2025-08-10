from agno.agent import Agent
# from agno.models.openai import OpenAIChat
from agno.models.google import Gemini
from agno.models.ollama import Ollama
from agno.tools.calculator import CalculatorTools
import dotenv
import os
dotenv.load_dotenv()
gemini_api_key = os.getenv("gemini_api_key")

agent = Agent(
    # model=OpenAIChat(id="gpt-4o"),
    # model=Ollama(id="qwen3:1.7b",host="http://103.245.237.43:11434"),
    model=Gemini(id="gemini-2.5-flash", api_key=gemini_api_key),
    description="You are an helpful assitant",
    markdown=True,
    tools=[
        CalculatorTools(
            add=True,
            subtract=True,
            multiply=True,
            divide=True,
            exponentiate=True,
            factorial=True,
            is_prime=True,
            square_root=True,
        )
    ],
    show_tool_calls=True,
)
# agent.print_response("Tell me about a breaking news story from New York.", stream=True)
res = agent.run(
    "100+200-32/5 =?", stream=True)
for r in res:
    print(r.content, end="")
