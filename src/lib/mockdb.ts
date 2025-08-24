import { v4 as randomUUID } from "uuid";
import { Quiz, Question, Attempt, AttemptAnswer } from "@/types";
import { isExpired } from "./date";
import { normalizeAndScore } from "./scoring";
import { slugify } from "./slug";
import { makeToken } from "./token";

// Mock participants data - separate from quiz attempts
let participants: Attempt[] = [];

let quizzes: Quiz[] = [
  {
    id: randomUUID(),
    title: "Test Masuk Service Management Batch 1",
    slug: "test-sm-batch-1",
    linkToken: "sm-batch-1-2024",
    isPublished: true,
    expiresAt: new Date(2025, 8, 30, 23, 59, 59).toISOString(), // Aug 30, 2025 23:59:59
    passingScore: 7, // minimum 7 correct answers to pass (70%)
    questionsPerPage: 5, // show 5 questions per page
    questions: [
      { 
        id: randomUUID(), 
        order: 1, 
        questionText: "Apa yang dimaksud dengan Service Management dalam konteks IT?", 
        questionType: 'multiple-choice',
        options: [
          'Mengelola hardware komputer',
          'Mengatur konfigurasi software',
          'Mengelola layanan IT untuk memenuhi kebutuhan bisnis',
          'Melakukan backup data'
        ],
        correctAnswer: "Mengelola layanan IT untuk memenuhi kebutuhan bisnis"
      },
      { 
        id: randomUUID(), 
        order: 2, 
        questionText: "ITIL singkatan dari?", 
        questionType: 'multiple-choice',
        options: [
          'Information Technology Infrastructure Library',
          'Information Technology Integration Level',
          'Internet Technology Information Library',
          'Internal Technology Infrastructure Level'
        ],
        correctAnswer: "Information Technology Infrastructure Library"
      },
      { 
        id: randomUUID(), 
        order: 3, 
        questionText: "Apa tujuan utama dari Incident Management?", 
        questionType: 'multiple-choice',
        options: [
          'Mencegah semua masalah terjadi',
          'Memulihkan layanan normal secepat mungkin',
          'Menganalisis akar masalah',
          'Melatih user'
        ],
        correctAnswer: "Memulihkan layanan normal secepat mungkin"
      },
      { 
        id: randomUUID(), 
        order: 4, 
        questionText: "SLA adalah singkatan dari?", 
        questionType: 'multiple-choice',
        options: [
          'Service Level Agreement',
          'System Level Access',
          'Software License Approval',
          'Security Level Authentication'
        ],
        correctAnswer: "Service Level Agreement"
      },
      { 
        id: randomUUID(), 
        order: 5, 
        questionText: "Apa yang dimaksud dengan Change Management dalam ITSM?", 
        questionType: 'multiple-choice',
        options: [
          'Mengubah struktur organisasi',
          'Mengelola perubahan pada infrastruktur IT secara terkontrol',
          'Mengubah kebijakan perusahaan',
          'Mengganti perangkat keras'
        ],
        correctAnswer: "Mengelola perubahan pada infrastruktur IT secara terkontrol"
      },
      { 
        id: randomUUID(), 
        order: 6, 
        questionText: "Apa kepanjangan dari CMDB?", 
        questionType: 'multiple-choice',
        options: [
          'Configuration Management Database',
          'Change Management Data Base',
          'Customer Management Database',
          'Computer Management Data Base'
        ],
        correctAnswer: "Configuration Management Database"
      },
      { 
        id: randomUUID(), 
        order: 7, 
        questionText: "Dalam Problem Management, apa yang dimaksud dengan Known Error?", 
        questionType: 'multiple-choice',
        options: [
          'Error yang sudah diperbaiki',
          'Error yang belum diketahui penyebabnya',
          'Problem yang sudah diidentifikasi akar penyebabnya',
          'Error yang sering terjadi'
        ],
        correctAnswer: "Problem yang sudah diidentifikasi akar penyebabnya"
      },
      { 
        id: randomUUID(), 
        order: 8, 
        questionText: "Apa fungsi utama Service Catalog?", 
        questionType: 'multiple-choice',
        options: [
          'Mencatat semua incident',
          'Menyediakan daftar layanan IT yang tersedia untuk user',
          'Menyimpan data konfigurasi',
          'Mengelola lisensi software'
        ],
        correctAnswer: "Menyediakan daftar layanan IT yang tersedia untuk user"
      },
      { 
        id: randomUUID(), 
        order: 9, 
        questionText: "Apa yang dimaksud dengan Service Continuity Management?", 
        questionType: 'multiple-choice',
        options: [
          'Memastikan layanan berjalan 24/7',
          'Memastikan layanan dapat dipulihkan setelah bencana',
          'Memastikan layanan selalu update',
          'Memastikan layanan aman dari virus'
        ],
        correctAnswer: "Memastikan layanan dapat dipulihkan setelah bencana"
      },
      { 
        id: randomUUID(), 
        order: 10, 
        questionText: "Prioritas incident ditentukan berdasarkan?", 
        questionType: 'multiple-choice',
        options: [
          'Impact dan Urgency',
          'Waktu kejadian',
          'Siapa yang melaporkan',
          'Kompleksitas masalah'
        ],
        correctAnswer: "Impact dan Urgency"
      }
    ],
    attempts: [],
    createdBy: "admin@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    title: "Test Masuk Network Administration Batch 2",
    slug: "test-network-batch-2",
    linkToken: "network-batch-2-2024",
    isPublished: true,
    expiresAt: new Date(2025, 9, 15, 17, 0, 0).toISOString(), // Sep 15, 2025 17:00:00
    passingScore: 6, // minimum 6 correct answers to pass (75%)
    questionsPerPage: 4,
    questions: [
      { 
        id: randomUUID(), 
        order: 1, 
        questionText: "Apa kepanjangan dari TCP/IP?", 
        questionType: 'multiple-choice',
        options: [
          'Transfer Control Protocol/Internet Protocol',
          'Transmission Control Protocol/Internet Protocol',
          'Technical Control Protocol/Internal Protocol',
          'Transport Control Protocol/Interface Protocol'
        ],
        correctAnswer: "Transmission Control Protocol/Internet Protocol"
      },
      { 
        id: randomUUID(), 
        order: 2, 
        questionText: "Port default untuk HTTP adalah?", 
        questionType: 'multiple-choice',
        options: ['21', '22', '80', '443'],
        correctAnswer: "80"
      },
      { 
        id: randomUUID(), 
        order: 3, 
        questionText: "Subnet mask /24 setara dengan?", 
        questionType: 'multiple-choice',
        options: ['255.255.0.0', '255.255.255.0', '255.255.255.128', '255.0.0.0'],
        correctAnswer: "255.255.255.0"
      },
      { 
        id: randomUUID(), 
        order: 4, 
        questionText: "Apa fungsi utama dari DNS?", 
        questionType: 'multiple-choice',
        options: [
          'Mengamankan koneksi internet',
          'Menerjemahkan nama domain ke IP address',
          'Mengatur bandwidth',
          'Memonitor traffic network'
        ],
        correctAnswer: "Menerjemahkan nama domain ke IP address"
      },
      { 
        id: randomUUID(), 
        order: 5, 
        questionText: "VLAN singkatan dari?", 
        questionType: 'multiple-choice',
        options: [
          'Virtual Local Area Network',
          'Variable Local Access Network',
          'Verified Local Area Network',
          'Visual Local Access Network'
        ],
        correctAnswer: "Virtual Local Area Network"
      },
      { 
        id: randomUUID(), 
        order: 6, 
        questionText: "Protocol yang digunakan untuk transfer file secara aman adalah?", 
        questionType: 'multiple-choice',
        options: ['FTP', 'HTTP', 'SFTP', 'SMTP'],
        correctAnswer: "SFTP"
      },
      { 
        id: randomUUID(), 
        order: 7, 
        questionText: "Apa yang dimaksud dengan NAT?", 
        questionType: 'multiple-choice',
        options: [
          'Network Access Table',
          'Network Address Translation',
          'Network Authentication Token',
          'Network Analysis Tool'
        ],
        correctAnswer: "Network Address Translation"
      },
      { 
        id: randomUUID(), 
        order: 8, 
        questionText: "Command untuk melihat routing table di Windows adalah?", 
        questionType: 'multiple-choice',
        options: ['ipconfig', 'netstat -r', 'route print', 'ping'],
        correctAnswer: "route print"
      }
    ],
    attempts: [],
    createdBy: "admin@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    title: "Test Multiple Choice dengan Checkbox",
    slug: "test-checkbox-demo",
    linkToken: "checkbox-demo-2024",
    isPublished: true,
    expiresAt: new Date(2025, 11, 31, 23, 59, 59).toISOString(), // Dec 31, 2025
    passingScore: 5,
    questionsPerPage: 3,
    questions: [
      { 
        id: randomUUID(), 
        order: 1, 
        questionText: "Pilih semua protokol yang termasuk dalam TCP/IP suite:", 
        questionType: 'multiple-select',
        options: [
          'HTTP',
          'FTP', 
          'SMTP',
          'NetBIOS',
          'TCP',
          'UDP'
        ],
        correctAnswer: "HTTP,FTP,SMTP,TCP,UDP"
      },
      { 
        id: randomUUID(), 
        order: 2, 
        questionText: "Pilih semua yang termasuk layer dalam OSI model:", 
        questionType: 'multiple-select',
        options: [
          'Physical',
          'Data Link',
          'Network',
          'Transport',
          'Internet',
          'Application'
        ],
        correctAnswer: "Physical,Data Link,Network,Transport,Application"
      },
      { 
        id: randomUUID(), 
        order: 3, 
        questionText: "Pilih semua yang termasuk dalam ITIL v4 service value chain:", 
        questionType: 'multiple-select',
        options: [
          'Plan',
          'Improve', 
          'Engage',
          'Design & Transition',
          'Obtain/Build',
          'Deliver & Support',
          'Monitor'
        ],
        correctAnswer: "Plan,Improve,Engage,Design & Transition,Obtain/Build,Deliver & Support"
      },
      { 
        id: randomUUID(), 
        order: 4, 
        questionText: "Pilih semua database yang termasuk NoSQL:", 
        questionType: 'multiple-select',
        options: [
          'MongoDB',
          'MySQL',
          'Redis',
          'PostgreSQL',
          'Cassandra',
          'CouchDB'
        ],
        correctAnswer: "MongoDB,Redis,Cassandra,CouchDB"
      },
      { 
        id: randomUUID(), 
        order: 5, 
        questionText: "Pilih semua yang termasuk cloud service model:", 
        questionType: 'multiple-select',
        options: [
          'IaaS (Infrastructure as a Service)',
          'PaaS (Platform as a Service)',
          'SaaS (Software as a Service)',
          'DaaS (Desktop as a Service)',
          'BaaS (Backend as a Service)',
          'NaaS (Network as a Service)'
        ],
        correctAnswer: "IaaS (Infrastructure as a Service),PaaS (Platform as a Service),SaaS (Software as a Service)"
      }
    ],
    attempts: [],
    createdBy: "admin@example.com", 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Initialize mock participants data
function initializeParticipants() {
  const smQuiz = quizzes.find(q => q.slug === 'test-sm-batch-1');
  const netQuiz = quizzes.find(q => q.slug === 'test-network-batch-2');
  
  participants = [
    // Service Management Batch 1 participants
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Ahmad Rizki Pratama",
      nij: "SM001",
      score: 8,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 7, 20, 14, 30, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Sari Dewi Kusuma",
      nij: "SM002", 
      score: 9,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 7, 20, 15, 45, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Budi Santoso",
      nij: "SM003",
      score: 5,
      passed: false,
      answers: [],
      submittedAt: new Date(2025, 7, 21, 9, 15, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Rani Permatasari",
      nij: "SM004",
      score: 7,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 7, 21, 10, 30, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Dedi Kurniawan",
      nij: "SM005",
      score: 6,
      passed: false,
      answers: [],
      submittedAt: new Date(2025, 7, 21, 11, 20, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Maya Anggraeni",
      nij: "SM006",
      score: 8,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 7, 22, 13, 45, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Fajar Setiawan",
      nij: "SM007",
      score: 4,
      passed: false,
      answers: [],
      submittedAt: new Date(2025, 7, 22, 14, 50, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: smQuiz?.id || '',
      participantName: "Linda Hartati",
      nij: "SM008",
      score: 9,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 7, 23, 8, 30, 0).toISOString(),
    },
    // Network Administration Batch 2 participants  
    {
      id: randomUUID(),
      quizId: netQuiz?.id || '',
      participantName: "Rio Ferdinan",
      nij: "NET001",
      score: 7,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 8, 5, 10, 15, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: netQuiz?.id || '',
      participantName: "Fitri Handayani",
      nij: "NET002",
      score: 5,
      passed: false,
      answers: [],
      submittedAt: new Date(2025, 8, 5, 11, 30, 0).toISOString(),
    },
    {
      id: randomUUID(),
      quizId: netQuiz?.id || '',
      participantName: "Arif Budiman",
      nij: "NET003",
      score: 6,
      passed: true,
      answers: [],
      submittedAt: new Date(2025, 8, 6, 9, 45, 0).toISOString(),
    }
  ];
}

// Initialize data
initializeParticipants();

export const db = {
  // ADMIN
  listQuizzes(by?: string) {
    return quizzes.filter(q => !by || q.createdBy === by);
  },
  getQuizById(id: string) {
    return quizzes.find(q => q.id === id) ?? null;
  },
  getQuizByToken(token: string) {
    return quizzes.find(q => q.linkToken === token) ?? null;
  },
  createQuiz(input: { title: string; expiresAt?: string | null; createdBy: string }) {
    const now = new Date().toISOString();
    const quiz: Quiz = {
      id: randomUUID(),
      title: input.title,
      slug: slugify(input.title),
      linkToken: makeToken(),
      isPublished: false,
      expiresAt: input.expiresAt ?? null,
      passingScore: 1, // default minimum 1 correct answer
      questionsPerPage: 5, // default 5 questions per page
      questions: [],
      attempts: [],
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    quizzes.unshift(quiz);
    return quiz;
  },
  
  updateQuiz(id: string, input: { 
    title?: string; 
    isPublished?: boolean; 
    expiresAt?: string | null;
    passingScore?: number;
    questionsPerPage?: number;
  }) {
    const q = this.getQuizById(id);
    if (!q) return null;
    Object.assign(q, input, { updatedAt: new Date().toISOString() });
    return q;
  },
  
  deleteQuiz(id: string) {
    const index = quizzes.findIndex(q => q.id === id);
    if (index === -1) return false;
    quizzes.splice(index, 1);
    return true;
  },
  
  duplicateQuiz(id: string, newTitle: string) {
    const original = this.getQuizById(id);
    if (!original) return null;
    
    const duplicated: Quiz = {
      ...original,
      id: randomUUID(),
      title: newTitle,
      slug: slugify(newTitle),
      linkToken: makeToken(),
      isPublished: false,
      attempts: [],
      questions: original.questions.map(q => ({ ...q, id: randomUUID() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    quizzes.unshift(duplicated);
    return duplicated;
  },

  addQuestion(quizId: string, input: { 
    questionText: string; 
    correctAnswer: string; 
    questionType: 'multiple-choice' | 'text';
    options?: string[];
  }) {
    const q = this.getQuizById(quizId);
    if (!q) return null;
    const order = (q.questions.at(-1)?.order ?? 0) + 1;
    const question: Question = {
      id: randomUUID(),
      order,
      questionText: input.questionText,
      questionType: input.questionType,
      options: input.options,
      correctAnswer: input.correctAnswer,
    };
    q.questions.push(question);
    q.updatedAt = new Date().toISOString();
    return question;
  },
  
  removeQuestion(quizId: string, questionId: string) {
    const q = this.getQuizById(quizId);
    if (!q) return false;
    q.questions = q.questions.filter(qq => qq.id !== questionId).map((qq, i) => ({ ...qq, order: i + 1 }));
    q.updatedAt = new Date().toISOString();
    return true;
  },

  // PUBLIC
  submitAttempt(quizToken: string, payload: { name: string; nij: string; answers: AttemptAnswer[] }) {
    const q = this.getQuizByToken(quizToken);
    if (!q) throw new Error("Test tidak ditemukan");
    if (!q.isPublished) throw new Error("Test belum dipublikasikan");
    if (isExpired(q.expiresAt)) throw new Error("Test sudah berakhir");

    // Check if participant already took this test (no retakes allowed)
    const exists = participants.some(p => 
      p.quizId === q.id && 
      p.nij.trim().toLowerCase() === payload.nij.trim().toLowerCase()
    );
    if (exists) throw new Error("NIJ sudah mengikuti test ini. Test hanya dapat dilakukan sekali.");

    const score = normalizeAndScore(q.questions, payload.answers);
    const passed = score >= q.passingScore;
    
    const attempt: Attempt = {
      id: randomUUID(),
      quizId: q.id,
      participantName: payload.name.trim(),
      nij: payload.nij.trim(),
      score,
      passed,
      answers: payload.answers,
      submittedAt: new Date().toISOString(),
    };
    
    // Add to global participants list
    participants.unshift(attempt);
    
    // Return simple success response without showing results
    return {
      success: true,
      message: "Test berhasil diselesaikan. Terima kasih atas partisipasi Anda."
    };
  },

  // Get participants for admin view
  getParticipants(quizId?: string) {
    if (quizId) {
      return participants.filter(p => p.quizId === quizId);
    }
    return participants;
  },

  // Get quiz statistics for admin
  getQuizStats() {
    const totalParticipants = participants.length;
    const uniqueParticipants = new Set(participants.map(p => p.nij)).size;
    const passedParticipants = participants.filter(p => p.passed).length;
    const failedParticipants = participants.filter(p => !p.passed).length;
    
    return {
      totalParticipants: uniqueParticipants,
      totalAttempts: totalParticipants,
      passedParticipants,
      failedParticipants,
    };
  },

  // Get recent activity for dashboard
  getRecentActivity() {
    return participants
      .slice(0, 10)
      .map(p => {
        const quiz = quizzes.find(q => q.id === p.quizId);
        return {
          ...p,
          quizTitle: quiz ? quiz.title : 'Unknown Test'
        };
      });
  },
};
