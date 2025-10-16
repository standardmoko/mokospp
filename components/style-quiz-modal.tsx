import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { ProgressIndicator } from '@/components/progress-indicator';
import { QuizOptionComponent } from '@/components/quiz-option';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { QuizStorageService } from '@/services/quiz-storage';
import { QUIZ_QUESTIONS, QuizResponse, QuizState } from '@/types/quiz';

interface StyleQuizModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (responses: QuizResponse[]) => void;
}

export function StyleQuizModal({ isVisible, onClose, onComplete }: StyleQuizModalProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    responses: [],
    isComplete: false,
  });

  const currentQuestion = QUIZ_QUESTIONS[quizState.currentQuestionIndex];
  const isFirstQuestion = quizState.currentQuestionIndex === 0;
  const isLastQuestion = quizState.currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
  
  // Helper function to get current response
  const getCurrentResponse = (): QuizResponse | null => {
    return quizState.responses.find(
      response => response.questionId === currentQuestion.id
    ) || null;
  };
  
  const canProceed = getCurrentResponse() !== null;

  // Load existing quiz data when modal opens
  useEffect(() => {
    if (isVisible) {
      loadExistingQuizData();
    }
  }, [isVisible]);

  const loadExistingQuizData = async () => {
    try {
      const existingData = await QuizStorageService.loadQuizData();
      if (existingData && existingData.responses.length > 0) {
        setQuizState({
          currentQuestionIndex: 0,
          responses: existingData.responses,
          isComplete: existingData.responses.length >= QUIZ_QUESTIONS.length,
        });
      }
    } catch (error) {
      console.error('Failed to load existing quiz data:', error);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    const newResponse: QuizResponse = {
      questionId: currentQuestion.id,
      selectedOptionIds: [optionId],
      timestamp: Date.now(),
    };

    setQuizState(prevState => {
      const updatedResponses = prevState.responses.filter(
        response => response.questionId !== currentQuestion.id
      );
      updatedResponses.push(newResponse);

      return {
        ...prevState,
        responses: updatedResponses,
      };
    });
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Complete quiz
      try {
        await QuizStorageService.saveQuizData(quizState.responses);
        setQuizState(prevState => ({ ...prevState, isComplete: true }));
        onComplete(quizState.responses);
        onClose();
      } catch (error) {
        console.error('Failed to save quiz data:', error);
        // Continue anyway - don't block user
        onComplete(quizState.responses);
        onClose();
      }
    } else {
      // Go to next question
      setQuizState(prevState => ({
        ...prevState,
        currentQuestionIndex: prevState.currentQuestionIndex + 1,
      }));
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setQuizState(prevState => ({
        ...prevState,
        currentQuestionIndex: prevState.currentQuestionIndex - 1,
      }));
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleClose = () => {
    // Reset to first question when closing
    setQuizState(prevState => ({
      ...prevState,
      currentQuestionIndex: 0,
    }));
    onClose();
  };

  const currentResponse = getCurrentResponse();
  const selectedOptionId = currentResponse?.selectedOptionIds[0] || null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver={true}
      avoidKeyboard={true}
      statusBarTranslucent={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ProgressIndicator
              currentStep={quizState.currentQuestionIndex + 1}
              totalSteps={QUIZ_QUESTIONS.length}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <IconSymbol name="xmark" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
          decelerationRate={0.998}
          scrollEventThrottle={1}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          scrollIndicatorInsets={{ right: 1 }}
          overScrollMode="never"
          directionalLockEnabled={true}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
        >
          <ThemedText style={[GlobalStyles.heading1, styles.questionTitle]}>
            {currentQuestion.title}
          </ThemedText>
          
          {currentQuestion.subtitle && (
            <ThemedText style={[GlobalStyles.bodyMedium, styles.questionSubtitle]}>
              {currentQuestion.subtitle}
            </ThemedText>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <QuizOptionComponent
                key={option.id}
                option={option}
                isSelected={selectedOptionId === option.id}
                onSelect={handleOptionSelect}
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.navigationButtons}>
            {!isFirstQuestion && (
              <TouchableOpacity
                style={[GlobalStyles.compactOutlineButton, styles.backButton]}
                onPress={handleBack}
              >
                <ThemedText style={GlobalStyles.compactOutlineButtonText}>
                  Back
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[GlobalStyles.compactOutlineButton, styles.skipButton]}
              onPress={handleSkip}
            >
              <ThemedText style={GlobalStyles.compactOutlineButtonText}>
                Skip Quiz
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                GlobalStyles.compactButton,
                styles.nextButton,
                !canProceed && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!canProceed}
            >
              <ThemedText style={[
                GlobalStyles.compactButtonText,
                !canProceed && styles.disabledButtonText,
              ]}>
                {isLastQuestion ? 'Complete' : 'Next'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    maxHeight: '95%',
    minHeight: '75%',
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },
  questionTitle: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  questionSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  optionsContainer: {
    paddingBottom: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backButton: {
    flex: 0,
    minWidth: 80,
  },
  skipButton: {
    flex: 0,
    minWidth: 100,
  },
  nextButton: {
    flex: 1,
    minWidth: 100,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  disabledButtonText: {
    color: Colors.textLighter,
  },
});
