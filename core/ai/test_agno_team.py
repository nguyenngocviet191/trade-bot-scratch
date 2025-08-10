from typing import Iterator  # noqa
from agno.agent import Agent
from agno.models.google import Gemini
from agno.team.team import Team
from agno.tools.yfinance import YFinanceTools
import dotenv
import os
dotenv.load_dotenv()
gemini_api_key = os.getenv("gemini_api_key")

stock_searcher = Agent(
    name="Stock Searcher",
    model=Gemini(id="gemini-2.5-flash", api_key=gemini_api_key),
    role="Searches the web for information on a stock.",
    tools=[
        YFinanceTools(
            stock_price=True,
            analyst_recommendations=True,
        )
    ],
)

company_info_agent = Agent(
    name="Company Info Searcher",
    model=Gemini(id="gemini-2.5-flash", api_key=gemini_api_key),
    role="Searches the web for information on a stock.",
    tools=[
        YFinanceTools(
            stock_price=False,
            company_info=True,
            company_news=True,
        )
    ],
)


team = Team(
    name="Stock Research Team",
    mode="route",
    model=Gemini(id="gemini-2.5-flash", api_key=gemini_api_key),
    members=[stock_searcher, company_info_agent],
    markdown=True,
    show_members_responses=True,
)

team.print_response("What is the current stock price of NVDA, review about NVDA?", stream=True)