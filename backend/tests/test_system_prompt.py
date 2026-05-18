import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import BASE_SYSTEM_PROMPT, SENSITIVITY_ADDENDUM


class TestSystemPromptInstructions:
    """
    Verify the system prompt encodes the constraints that determine model behavior.
    These tests catch accidental edits to the prompt that would break the coaching contract.
    """

    def test_instructs_rewrite_written_as_user(self):
        assert "AS the user" in BASE_SYSTEM_PROMPT

    def test_forbids_meta_questions_to_user(self):
        assert "Could you specify" in BASE_SYSTEM_PROMPT

    def test_forbids_advice_phrasing(self):
        assert "You should add" in BASE_SYSTEM_PROMPT

    def test_requires_json_format_with_needs_improvement_field(self):
        assert '"needs_improvement"' in BASE_SYSTEM_PROMPT

    def test_requires_json_format_with_suggested_prompt_field(self):
        assert '"suggested_prompt"' in BASE_SYSTEM_PROMPT

    def test_prohibits_markdown_in_response(self):
        assert "markdown" in BASE_SYSTEM_PROMPT.lower()

    def test_json_rules_prohibit_question_directed_at_user(self):
        assert "Must NOT be a question directed at the user" in BASE_SYSTEM_PROMPT

    def test_json_rules_prohibit_coaching_advice(self):
        assert "Must NOT be coaching advice" in BASE_SYSTEM_PROMPT

    def test_json_rules_prohibit_preamble(self):
        assert "Must NOT include preamble" in BASE_SYSTEM_PROMPT

    def test_no_improvement_means_null_fields(self):
        assert "needs_improvement is false, all other fields should be null" in BASE_SYSTEM_PROMPT


class TestSensitivityAddenda:
    def test_all_three_sensitivity_levels_defined(self):
        assert 1 in SENSITIVITY_ADDENDUM
        assert 2 in SENSITIVITY_ADDENDUM
        assert 3 in SENSITIVITY_ADDENDUM

    def test_low_sensitivity_ignores_minor_improvements(self):
        assert "Ignore minor" in SENSITIVITY_ADDENDUM[1]

    def test_high_sensitivity_catches_any_improvement(self):
        assert "any prompt" in SENSITIVITY_ADDENDUM[3].lower()

    def test_addenda_are_distinct(self):
        assert SENSITIVITY_ADDENDUM[1] != SENSITIVITY_ADDENDUM[2]
        assert SENSITIVITY_ADDENDUM[2] != SENSITIVITY_ADDENDUM[3]
