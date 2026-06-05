import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from response_parser import parse_model_response


class TestLayer1CleanJSON:
    def test_no_improvement_all_nulls(self):
        raw = '{"needs_improvement": false}'
        result = parse_model_response(raw)
        assert result.needs_improvement is False
        assert result.observation is None
        assert result.why_it_matters is None
        assert result.suggested_prompt is None

    def test_improvement_with_all_fields(self):
        raw = (
            '{"needs_improvement": true, "observation": "Too vague", '
            '"why_it_matters": "AI needs context", '
            '"suggested_prompt": "Explain how transformers work in NLP"}'
        )
        result = parse_model_response(raw)
        assert result.needs_improvement is True
        assert result.observation == "Too vague"
        assert result.why_it_matters == "AI needs context"
        assert result.suggested_prompt == "Explain how transformers work in NLP"

    def test_strips_json_markdown_fence(self):
        raw = '```json\n{"needs_improvement": false}\n```'
        result = parse_model_response(raw)
        assert result.needs_improvement is False

    def test_strips_bare_markdown_fence(self):
        raw = '```\n{"needs_improvement": false}\n```'
        result = parse_model_response(raw)
        assert result.needs_improvement is False


class TestLayer2BuriedJSON:
    def test_json_with_leading_preamble(self):
        raw = (
            "Here is my evaluation:\n"
            '{"needs_improvement": true, "observation": "Needs more detail", '
            '"why_it_matters": "Better results", '
            '"suggested_prompt": "Tell me about quantum computing for beginners"}'
        )
        result = parse_model_response(raw)
        assert result.needs_improvement is True
        assert result.observation == "Needs more detail"
        assert result.suggested_prompt == "Tell me about quantum computing for beginners"

    def test_json_with_leading_and_trailing_text(self):
        raw = 'Analysis complete:\n{"needs_improvement": false}\nHope that helps!'
        result = parse_model_response(raw)
        assert result.needs_improvement is False


class TestLayer3StructuredText:
    def test_extracts_labeled_sections(self):
        # Parser reads content from the line AFTER the section header, not inline.
        raw = (
            "Observation\n"
            "The prompt lacks specificity about the topic.\n"
            "Why it matters\n"
            "The AI cannot provide a focused response without context.\n"
            "Suggested Prompt\n"
            "Explain the main differences between supervised and unsupervised "
            "machine learning with real-world examples."
        )
        result = parse_model_response(raw)
        assert result.needs_improvement is True
        assert result.observation is not None
        assert "specificity" in result.observation
        assert result.suggested_prompt is not None

    def test_fallback_no_improvement_when_no_recognizable_sections(self):
        raw = "This is some random text with no structured data whatsoever."
        result = parse_model_response(raw)
        assert result.needs_improvement is False


class TestLayer4SafeDefault:
    def test_garbled_braces(self):
        result = parse_model_response("{{{invalid json }{]}")
        assert result.needs_improvement is False
        assert result.observation is None
        assert result.suggested_prompt is None

    def test_empty_string(self):
        result = parse_model_response("")
        assert result.needs_improvement is False

    def test_only_whitespace(self):
        result = parse_model_response("   \n\n  ")
        assert result.needs_improvement is False


class TestSuggestedPromptContentContract:
    """
    The system prompt instructs the model to write suggested_prompt as a
    ready-to-send prompt, not as coaching advice. These tests document that
    contract and verify the parser preserves whatever value is in the JSON.
    """

    def test_direct_prompt_is_preserved_unchanged(self):
        suggested = "What are the key differences between React and Vue for building SPAs?"
        raw = (
            f'{{"needs_improvement": true, "observation": "Vague", '
            f'"why_it_matters": "Context helps", "suggested_prompt": "{suggested}"}}'
        )
        result = parse_model_response(raw)
        assert result.suggested_prompt == suggested

    def test_suggested_prompt_not_starting_with_meta_question(self):
        # A compliant model response should never produce this, but we document
        # the expected contract: suggested_prompt must be a prompt, not advice.
        good_prompt = "Explain machine learning to a high school student using everyday analogies."
        raw = (
            f'{{"needs_improvement": true, "observation": "Too broad", '
            f'"why_it_matters": "Specificity improves answers", '
            f'"suggested_prompt": "{good_prompt}"}}'
        )
        result = parse_model_response(raw)
        assert not result.suggested_prompt.lower().startswith("could you")
        assert not result.suggested_prompt.lower().startswith("you should")
        assert not result.suggested_prompt.lower().startswith("try adding")
        assert not result.suggested_prompt.lower().startswith("here's a better")
