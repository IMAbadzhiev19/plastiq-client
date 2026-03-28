import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PracticeState } from "../types";
import { theme } from "../theme";
import { LockIcon } from "../components/icons";
import { Card, EmptyState, Screen } from "../components/ui";

type PracticeScreenProps = {
  practiceState: PracticeState;
  isSubmittingAnswer?: boolean;
  onSubmitAnswer: (questionId: string, selectedAnswer: string) => Promise<void>;
};

export function PracticeScreen({
  practiceState,
  isSubmittingAnswer = false,
  onSubmitAnswer,
}: PracticeScreenProps) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Practice</Text>
          <Text style={styles.subtitle}>Answer questions to learn more</Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{practiceState.headline}</Text>
          <Text style={styles.summaryText}>{practiceState.description}</Text>
        </Card>

        {practiceState.availableToday ? (
          practiceState.questions.map((question, index) => (
            <Card key={question.id} style={styles.questionCard}>
              <Text style={styles.questionLabel}>Question {index + 1}</Text>
              <Text style={styles.questionPrompt}>{question.prompt}</Text>
              <View style={styles.options}>
                {question.options.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.option,
                      question.answered && option === question.answer && styles.correctOption,
                      question.answered &&
                        option === question.selectedAnswer &&
                        option !== question.answer &&
                        styles.incorrectOption,
                    ]}
                    disabled={question.answered || isSubmittingAnswer}
                    onPress={() => onSubmitAnswer(question.id, option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        question.answered && option === question.answer && styles.correctOptionText,
                        question.answered &&
                          option === question.selectedAnswer &&
                          option !== question.answer &&
                          styles.incorrectOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {question.answered ? (
                <View style={styles.explanationCard}>
                  <Text style={styles.explanationTitle}>
                    {question.isCorrect ? "Correct answer" : `Correct answer: ${question.answer}`}
                  </Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
              ) : null}
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<LockIcon />}
            title={practiceState.headline}
            description={practiceState.description}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  summaryCard: {
    padding: 16,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  title: {
    fontSize: theme.typography.h2 + 6,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  questionCard: {
    padding: 18,
    gap: 14,
  },
  questionLabel: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionPrompt: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.text,
    fontWeight: "700",
  },
  options: {
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  correctOption: {
    backgroundColor: "#E8FFF1",
    borderColor: "#75D49C",
  },
  incorrectOption: {
    backgroundColor: "#FFF0EC",
    borderColor: "#FFB9A9",
  },
  correctOptionText: {
    color: "#167C43",
    fontWeight: "700",
  },
  incorrectOptionText: {
    color: "#C14A2D",
    fontWeight: "700",
  },
  explanationCard: {
    marginTop: 4,
    padding: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: "#F5F8FD",
    gap: 4,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
});
