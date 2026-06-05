import sys
import os
from unittest.mock import patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from main import app, SENSITIVITY_ADDENDUM

client = TestClient(app)

VALID_JSON_NO_IMPROVEMENT = '{"needs_improvement": false}'
VALID_JSON_WITH_IMPROVEMENT = (
    '{"needs_improvement": true, "observation": "Too broad", '
    '"why_it_matters": "Specific prompts yield better answers", '
    '"suggested_prompt": "What are the key differences between black holes and neutron stars?"}'
)


class TestHealthEndpoint:
    def test_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200

    def test_returns_ok_status(self):
        response = client.get("/health")
        assert response.json() == {"status": "ok"}


class TestEvaluateEndpoint:
    @patch("main.ollama.chat")
    def test_returns_200_on_valid_prompt(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        response = client.post("/evaluate", json={"prompt": "Tell me about space exploration"})
        assert response.status_code == 200

    @patch("main.ollama.chat")
    def test_response_contains_needs_improvement_field(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        data = client.post("/evaluate", json={"prompt": "Tell me about space"}).json()
        assert "needs_improvement" in data

    @patch("main.ollama.chat")
    def test_no_improvement_response_nulls_other_fields(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        data = client.post("/evaluate", json={"prompt": "Tell me about space"}).json()
        assert data["needs_improvement"] is False
        assert data["observation"] is None
        assert data["suggested_prompt"] is None

    @patch("main.ollama.chat")
    def test_improvement_response_populates_all_fields(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_WITH_IMPROVEMENT}}
        data = client.post("/evaluate", json={"prompt": "space"}).json()
        assert data["needs_improvement"] is True
        assert data["observation"] is not None
        assert data["why_it_matters"] is not None
        assert data["suggested_prompt"] is not None

    @patch("main.ollama.chat")
    def test_suggested_prompt_is_not_meta_question(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_WITH_IMPROVEMENT}}
        data = client.post("/evaluate", json={"prompt": "space"}).json()
        suggested = data["suggested_prompt"].lower()
        assert not suggested.startswith("could you")
        assert not suggested.startswith("you should")
        assert not suggested.startswith("try adding")

    @patch("main.ollama.chat")
    def test_forwards_specified_model_to_ollama(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Test prompt about AI systems", "model": "llama3"})
        assert mock_chat.call_args.kwargs["model"] == "llama3"

    @patch("main.ollama.chat")
    def test_default_model_is_phi4_mini(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Test prompt about AI systems"})
        assert mock_chat.call_args.kwargs["model"] == "phi4-mini"


class TestSensitivityRouting:
    @patch("main.ollama.chat")
    def test_sensitivity_1_appends_low_addendum(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Tell me about AI systems today", "sensitivity": 1})
        system = mock_chat.call_args.kwargs["messages"][0]["content"]
        assert SENSITIVITY_ADDENDUM[1] in system

    @patch("main.ollama.chat")
    def test_sensitivity_2_appends_medium_addendum(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Tell me about AI systems today", "sensitivity": 2})
        system = mock_chat.call_args.kwargs["messages"][0]["content"]
        assert SENSITIVITY_ADDENDUM[2] in system

    @patch("main.ollama.chat")
    def test_sensitivity_3_appends_high_addendum(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Tell me about AI systems today", "sensitivity": 3})
        system = mock_chat.call_args.kwargs["messages"][0]["content"]
        assert SENSITIVITY_ADDENDUM[3] in system

    @patch("main.ollama.chat")
    def test_default_sensitivity_is_medium(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Tell me about AI systems today"})
        system = mock_chat.call_args.kwargs["messages"][0]["content"]
        assert SENSITIVITY_ADDENDUM[2] in system
        assert SENSITIVITY_ADDENDUM[1] not in system
        assert SENSITIVITY_ADDENDUM[3] not in system

    @patch("main.ollama.chat")
    def test_system_prompt_contains_base_and_addendum(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        client.post("/evaluate", json={"prompt": "Tell me about AI", "sensitivity": 2})
        system = mock_chat.call_args.kwargs["messages"][0]["content"]
        assert "AI Literacy Coach" in system
        assert SENSITIVITY_ADDENDUM[2] in system

    @patch("main.ollama.chat")
    def test_user_prompt_passed_as_user_message(self, mock_chat):
        mock_chat.return_value = {"message": {"content": VALID_JSON_NO_IMPROVEMENT}}
        prompt_text = "Explain reinforcement learning to a beginner"
        client.post("/evaluate", json={"prompt": prompt_text})
        messages = mock_chat.call_args.kwargs["messages"]
        user_message = next(m for m in messages if m["role"] == "user")
        assert user_message["content"] == prompt_text
