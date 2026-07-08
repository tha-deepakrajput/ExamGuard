import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "../auth/password";
import * as schema from "./schema";

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log("🌱 Starting database seed...\n");

  console.log("Clearing existing exams and questions...");
  await db.delete(schema.questions);
  await db.delete(schema.examSections);
  await db.delete(schema.exams);
  
  // ─── Create Users ──────────────────────────────────────────
  console.log("Creating users...");
  const passwordHash = await hashPassword("Password@123");

  const [superAdmin] = await db
    .insert(schema.users)
    .values({
      email: "superadmin@examguard.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin",
      status: "active",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { role: "super_admin" },
    })
    .returning();

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@examguard.com",
      passwordHash,
      firstName: "John",
      lastName: "Admin",
      role: "admin",
      status: "active",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { role: "admin" },
    })
    .returning();

  const students = [];
  const studentData = [
    { firstName: "Alice", lastName: "Johnson", email: "alice@examguard.com" },
    { firstName: "Bob", lastName: "Smith", email: "bob@examguard.com" },
    { firstName: "Charlie", lastName: "Brown", email: "charlie@examguard.com" },
    { firstName: "Diana", lastName: "Prince", email: "diana@examguard.com" },
    { firstName: "Edward", lastName: "Norton", email: "edward@examguard.com" },
    { firstName: "Fiona", lastName: "Apple", email: "fiona@examguard.com" },
    { firstName: "George", lastName: "Lucas", email: "george@examguard.com" },
    { firstName: "Hannah", lastName: "Montana", email: "hannah@examguard.com" },
    { firstName: "Ivan", lastName: "Drago", email: "ivan@examguard.com" },
    { firstName: "Julia", lastName: "Roberts", email: "julia@examguard.com" },
  ];

  // Also create a default student account for demo
  const [demoStudent] = await db
    .insert(schema.users)
    .values({
      email: "student@examguard.com",
      passwordHash,
      firstName: "Demo",
      lastName: "Student",
      role: "student",
      status: "active",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { role: "student" },
    })
    .returning();
  students.push(demoStudent);

  for (const s of studentData) {
    const [student] = await db
      .insert(schema.users)
      .values({
        ...s,
        passwordHash,
        role: "student",
        status: "active",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { role: "student" },
      })
      .returning();
    students.push(student);
  }

  console.log(`  ✅ Created ${students.length + 2} users`);

  // ─── Create Exams ──────────────────────────────────────────
  console.log("Creating examinations...");

  const examData = [
    {
      title: "Advanced Mathematics - Final Exam",
      description:
        "Comprehensive final examination covering calculus, linear algebra, and differential equations.",
      slug: "advanced-mathematics-final",
      subject: "Mathematics",
      category: "Final Exam",
      durationMinutes: 120,
      totalMarks: 100,
      passingPercentage: 40,
      instructions:
        "Read each question carefully. All questions are mandatory. No calculators allowed.",
      status: "published" as const,
      proctoringEnabled: true,
    },
    {
      title: "Data Structures & Algorithms",
      description:
        "Test your understanding of arrays, linked lists, trees, graphs, and algorithm complexity.",
      slug: "data-structures-algorithms",
      subject: "Computer Science",
      category: "Mid Term",
      durationMinutes: 90,
      totalMarks: 80,
      passingPercentage: 35,
      instructions:
        "Answer all questions. Multiple-choice questions have only one correct answer unless stated otherwise.",
      status: "published" as const,
      proctoringEnabled: true,
    },
    {
      title: "English Literature - Assessment",
      description:
        "Analysis of Shakespeare, modern poetry, and narrative techniques.",
      slug: "english-literature-assessment",
      subject: "English",
      category: "Assessment",
      durationMinutes: 60,
      totalMarks: 50,
      passingPercentage: 40,
      instructions:
        "Write clear and concise answers. Pay attention to grammar and spelling.",
      status: "published" as const,
      proctoringEnabled: false,
    },
    {
      title: "Physics - Mechanics Unit Test",
      description: "Newton's laws, kinematics, work-energy theorem, and rotational motion.",
      slug: "physics-mechanics-unit-test",
      subject: "Physics",
      category: "Unit Test",
      durationMinutes: 45,
      totalMarks: 40,
      passingPercentage: 35,
      instructions: "Show your working for numerical problems.",
      status: "draft" as const,
      proctoringEnabled: true,
    },
    {
      title: "General Knowledge Quiz",
      description: "Current affairs, history, geography, and science awareness.",
      slug: "general-knowledge-quiz",
      subject: "General",
      category: "Quiz",
      durationMinutes: 30,
      totalMarks: 30,
      passingPercentage: 33,
      instructions: "Quick quiz. Each question carries 1 mark. No negative marking.",
      status: "published" as const,
      proctoringEnabled: false,
      negativeMarkingPercentage: 0,
    },
  ];

  const createdExams = [];
  for (const exam of examData) {
    const [created] = await db
      .insert(schema.exams)
      .values({
        ...exam,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        createdBy: admin.id,
      })
      .returning();
    createdExams.push(created);
  }

  console.log(`  ✅ Created ${createdExams.length} examinations`);

  // ─── Create Sections for first exam ────────────────────────
  console.log("Creating exam sections...");

  const [sectionA] = await db
    .insert(schema.examSections)
    .values({
      examId: createdExams[0].id,
      title: "Section A - Multiple Choice",
      description: "Answer all questions. Each question carries 2 marks.",
      order: 1,
      marksPerQuestion: 2,
      isMandatory: true,
    })
    .returning();

  const [sectionB] = await db
    .insert(schema.examSections)
    .values({
      examId: createdExams[0].id,
      title: "Section B - Short Answers",
      description: "Answer any 5 out of 7 questions. Each carries 5 marks.",
      order: 2,
      marksPerQuestion: 5,
      isMandatory: true,
    })
    .returning();

  console.log("  ✅ Created 2 exam sections");

  // ─── Create Questions ──────────────────────────────────────
  console.log("Creating questions...");

  // MCQ questions for Math exam
  const mcqQuestions = [
    {
      text: "What is the derivative of sin(x)?",
      options: [
        { text: "cos(x)", isCorrect: true },
        { text: "-cos(x)", isCorrect: false },
        { text: "sin(x)", isCorrect: false },
        { text: "-sin(x)", isCorrect: false },
      ],
    },
    {
      text: "The integral of 1/x dx is:",
      options: [
        { text: "ln|x| + C", isCorrect: true },
        { text: "x² + C", isCorrect: false },
        { text: "1/x² + C", isCorrect: false },
        { text: "e^x + C", isCorrect: false },
      ],
    },
    {
      text: "A 3×3 identity matrix has a determinant equal to:",
      options: [
        { text: "1", isCorrect: true },
        { text: "0", isCorrect: false },
        { text: "3", isCorrect: false },
        { text: "-1", isCorrect: false },
      ],
    },
    {
      text: "The Laplace transform of e^(at) is:",
      options: [
        { text: "1/(s-a)", isCorrect: true },
        { text: "1/(s+a)", isCorrect: false },
        { text: "s/(s-a)", isCorrect: false },
        { text: "a/(s-a)", isCorrect: false },
      ],
    },
    {
      text: "Which of the following is a second-order differential equation?",
      options: [
        { text: "y'' + y = 0", isCorrect: true },
        { text: "y' + y = 0", isCorrect: false },
        { text: "y + x = 0", isCorrect: false },
        { text: "y''' + y = 0", isCorrect: false },
      ],
    },
  ];

  let questionCount = 0;
  for (let i = 0; i < mcqQuestions.length; i++) {
    const q = mcqQuestions[i];
    const [question] = await db
      .insert(schema.questions)
      .values({
        examId: createdExams[0].id,
        sectionId: sectionA.id,
        type: "mcq",
        text: q.text,
        marks: 2,
        negativeMarks: 0.5,
        difficulty: i < 2 ? "easy" : i < 4 ? "medium" : "hard",
        tags: ["mathematics", "calculus"],
        order: i + 1,
        createdBy: admin.id,
      })
      .returning();

    for (let j = 0; j < q.options.length; j++) {
      await db.insert(schema.questionOptions).values({
        questionId: question.id,
        text: q.options[j].text,
        isCorrect: q.options[j].isCorrect,
        order: j + 1,
      });
    }
    questionCount++;
  }

  // True/False questions
  const tfQuestions = [
    { text: "The derivative of a constant is always zero.", correct: true },
    { text: "Every continuous function is differentiable.", correct: false },
    { text: "The rank of a zero matrix is 0.", correct: true },
  ];

  for (let i = 0; i < tfQuestions.length; i++) {
    const q = tfQuestions[i];
    const [question] = await db
      .insert(schema.questions)
      .values({
        examId: createdExams[0].id,
        sectionId: sectionA.id,
        type: "true_false",
        text: q.text,
        marks: 1,
        difficulty: "easy",
        tags: ["mathematics"],
        order: mcqQuestions.length + i + 1,
        createdBy: admin.id,
      })
      .returning();

    await db.insert(schema.questionOptions).values([
      { questionId: question.id, text: "True", isCorrect: q.correct, order: 1 },
      { questionId: question.id, text: "False", isCorrect: !q.correct, order: 2 },
    ]);
    questionCount++;
  }

  // Fill in the blank
  const [fillQ] = await db
    .insert(schema.questions)
    .values({
      examId: createdExams[0].id,
      sectionId: sectionB.id,
      type: "fill_blank",
      text: "The value of lim(x→0) sin(x)/x = ____",
      correctAnswer: "1",
      marks: 5,
      difficulty: "medium",
      tags: ["mathematics", "limits"],
      order: 1,
      createdBy: admin.id,
    })
    .returning();
  questionCount++;

  // Descriptive
  await db.insert(schema.questions).values({
    examId: createdExams[0].id,
    sectionId: sectionB.id,
    type: "descriptive",
    text: "Prove that the derivative of x^n is nx^(n-1) using the first principles of differentiation.",
    marks: 10,
    difficulty: "hard",
    tags: ["mathematics", "calculus", "proof"],
    order: 2,
    createdBy: admin.id,
  });
  questionCount++;

  // Add questions to DSA exam
  const dsaQuestions = [
    {
      text: "What is the time complexity of binary search?",
      options: [
        { text: "O(log n)", isCorrect: true },
        { text: "O(n)", isCorrect: false },
        { text: "O(n log n)", isCorrect: false },
        { text: "O(1)", isCorrect: false },
      ],
    },
    {
      text: "Which data structure uses LIFO principle?",
      options: [
        { text: "Stack", isCorrect: true },
        { text: "Queue", isCorrect: false },
        { text: "Array", isCorrect: false },
        { text: "Linked List", isCorrect: false },
      ],
    },
    {
      text: "The worst-case time complexity of quicksort is:",
      options: [
        { text: "O(n²)", isCorrect: true },
        { text: "O(n log n)", isCorrect: false },
        { text: "O(n)", isCorrect: false },
        { text: "O(log n)", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < dsaQuestions.length; i++) {
    const q = dsaQuestions[i];
    const [question] = await db
      .insert(schema.questions)
      .values({
        examId: createdExams[1].id,
        type: "mcq",
        text: q.text,
        marks: 4,
        difficulty: "medium",
        tags: ["dsa", "computer-science"],
        order: i + 1,
        createdBy: admin.id,
      })
      .returning();

    for (let j = 0; j < q.options.length; j++) {
      await db.insert(schema.questionOptions).values({
        questionId: question.id,
        text: q.options[j].text,
        isCorrect: q.options[j].isCorrect,
        order: j + 1,
      });
    }
    questionCount++;
  }

  console.log(`  ✅ Created ${questionCount} questions`);

  // ─── Create Question Bank Categories ───────────────────────
  console.log("Creating question bank categories...");

  await db.insert(schema.questionBankCategories).values([
    { name: "Mathematics", description: "All mathematics questions" },
    { name: "Computer Science", description: "Programming and CS theory" },
    { name: "Physics", description: "Physics concepts and problems" },
    { name: "English", description: "Language and literature" },
    { name: "General Knowledge", description: "Current affairs and GK" },
  ]);

  console.log("  ✅ Created 5 question bank categories");

  // ─── Create System Settings ────────────────────────────────
  console.log("Creating system settings...");

  await db.insert(schema.systemSettings).values([
    {
      key: "proctoring.max_violations",
      value: JSON.stringify(5),
      description: "Maximum violations before auto-termination",
    },
    {
      key: "proctoring.snapshot_interval",
      value: JSON.stringify(30),
      description: "Webcam snapshot interval in seconds",
    },
    {
      key: "proctoring.face_detection_interval",
      value: JSON.stringify(2),
      description: "Face detection check interval in seconds",
    },
    {
      key: "exam.default_duration",
      value: JSON.stringify(60),
      description: "Default exam duration in minutes",
    },
    {
      key: "exam.default_passing_percentage",
      value: JSON.stringify(40),
      description: "Default passing percentage",
    },
    {
      key: "app.maintenance_mode",
      value: JSON.stringify(false),
      description: "Enable maintenance mode",
    },
  ]);

  console.log("  ✅ Created 6 system settings");

  console.log("\n✨ Database seed completed successfully!");
  console.log("\n📋 Demo Accounts:");
  console.log("  Super Admin: superadmin@examguard.com / Password@123");
  console.log("  Admin:       admin@examguard.com / Password@123");
  console.log("  Student:     student@examguard.com / Password@123");
  console.log(`  + ${studentData.length} additional student accounts`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
