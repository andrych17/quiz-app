import { v4 as randomUUID } from "uuid";
import { Quiz, Question, Attempt, AttemptAnswer, User, ConfigItem, AdminStats } from "@/types";
import { isExpired } from "./date";
import { normalizeAndScore } from "./scoring";
import { slugify } from "./slug";
import { makeToken } from "./token";

// Mock users data for admin
const users: User[] = [
  {
    id: "1",
    email: "superadmin@quiz-app.com",
    name: "Super Administrator", 
    role: "superadmin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-08-15T10:30:00Z",
    createdBy: "system",
    updatedBy: "superadmin@quiz-app.com",
    lastLogin: "2025-08-31T10:30:00Z",
    isActive: true
  },
  {
    id: "2", 
    email: "admin2@quiz-app.com",
    name: "Quiz Admin 2",
    role: "admin",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2025-07-20T12:15:00Z",
    createdBy: "admin@quiz-app.com",
    updatedBy: "admin2@quiz-app.com",
    lastLogin: "2025-08-30T15:45:00Z",
    isActive: true
  },
  {
    id: "3",
    email: "john.doe@gms.com",
    name: "John Doe",
    role: "admin",
    createdAt: "2024-03-20T00:00:00Z",
    updatedAt: "2025-06-10T14:30:00Z",
    createdBy: "superadmin@gms.com",
    updatedBy: "superadmin@gms.com",
    lastLogin: "2025-08-29T08:20:00Z",
    isActive: true
  },
  {
    id: "4",
    email: "jane.smith@gms.com", 
    name: "Jane Smith",
    role: "admin",
    createdAt: "2024-04-10T00:00:00Z",
    updatedAt: "2025-05-25T16:45:00Z",
    createdBy: "admin@gms.com",
    updatedBy: "jane.smith@gms.com",
    lastLogin: "2025-08-28T14:15:00Z",
    isActive: true
  },
  {
    id: "5",
    email: "michael.wilson@gms.com",
    name: "Michael Wilson",
    role: "superadmin",
    createdAt: "2024-05-05T00:00:00Z",
    updatedAt: "2025-04-18T11:20:00Z",
    createdBy: "superadmin@gms.com",
    updatedBy: "michael.wilson@gms.com",
    lastLogin: "2025-08-27T16:30:00Z",
    isActive: true
  },
  {
    id: "6",
    email: "sarah.johnson@gms.com",
    name: "Sarah Johnson",
    role: "admin",
    createdAt: "2024-06-12T00:00:00Z",
    updatedAt: "2025-03-30T09:10:00Z",
    createdBy: "admin@gms.com",
    updatedBy: "sarah.johnson@gms.com",
    lastLogin: "2025-08-26T11:45:00Z",
    isActive: true
  },
  {
    id: "7",
    email: "david.brown@gms.com",
    name: "David Brown",
    role: "admin", 
    createdAt: "2024-07-18T00:00:00Z",
    createdBy: "superadmin@gms.com",
    lastLogin: "2025-08-25T13:20:00Z",
    isActive: true
  },
  {
    id: "8",
    email: "emily.davis@gms.com",
    name: "Emily Davis",
    role: "admin",
    createdAt: "2024-08-22T00:00:00Z",
    createdBy: "admin@gms.com",
    lastLogin: "2025-08-24T09:10:00Z",
    isActive: false
  },
  {
    id: "9",
    email: "robert.miller@gms.com",
    name: "Robert Miller", 
    role: "superadmin",
    createdAt: "2024-09-08T00:00:00Z",
    createdBy: "superadmin@gms.com",
    lastLogin: "2025-08-23T12:35:00Z",
    isActive: true
  },
  {
    id: "10",
    email: "lisa.garcia@gms.com",
    name: "Lisa Garcia",
    role: "admin",
    createdAt: "2024-10-14T00:00:00Z",
    createdBy: "admin@gms.com",
    lastLogin: "2025-08-22T15:50:00Z",
    isActive: true
  },
  {
    id: "11",
    email: "james.rodriguez@gms.com",
    name: "James Rodriguez",
    role: "admin",
    createdAt: "2024-11-25T00:00:00Z",
    createdBy: "superadmin@gms.com",
    isActive: false
  },
  {
    id: "12",
    email: "amanda.martinez@gms.com",
    name: "Amanda Martinez", 
    role: "admin",
    createdAt: "2024-12-30T00:00:00Z",
    createdBy: "admin@gms.com",
    isActive: true
  }
];

// Mock config data
const configs: ConfigItem[] = [
  {
    id: "1",
    group: "Ministry Types",
    key: "pelayanan_anak",
    value: "Pelayanan Anak",
    description: "Pelayanan untuk anak-anak gereja",
    order: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system"
  },
  {
    id: "2",
    group: "Ministry Types",
    key: "pelayanan_remaja", 
    value: "Pelayanan Remaja",
    description: "Pelayanan untuk remaja gereja",
    order: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system"
  },
  {
    id: "3",
    group: "Question Types",
    key: "multiple_choice",
    value: "Multiple Choice",
    description: "Pilihan ganda dengan satu jawaban benar",
    order: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system"
  }
];

// Mock participants data - separate from quiz attempts
let participants: Attempt[] = [];

const quizzes: Quiz[] = [
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

  // User management methods
  getUsers: (): User[] => {
    return users;
  },

  getUserById: (id: string): User | null => {
    return users.find(u => u.id === id) || null;
  },

  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): User => {
    const newUser: User = {
      ...userData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: "admin@gms.com", // In real app, get from session
      isActive: true
    };
    users.push(newUser);
    return newUser;
  },

  updateUser: (id: string, userData: Partial<User>): User | null => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = { 
      ...users[userIndex], 
      ...userData,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@gms.com" // In real app, get from session
    };
    return users[userIndex];
  },

  deleteUser: (id: string): boolean => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    
    users.splice(userIndex, 1);
    return true;
  },

  // Config management methods
  getConfigs: (): ConfigItem[] => {
    return configs;
  },

  getConfigsByGroup: (group: string): ConfigItem[] => {
    return configs.filter(c => c.group === group);
  },

  createConfig: (configData: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): ConfigItem => {
    const newConfig: ConfigItem = {
      ...configData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin@gms.com", // In real app, get from session
      isActive: true
    };
    configs.push(newConfig);
    return newConfig;
  },

  updateConfig: (id: string, configData: Partial<ConfigItem>): ConfigItem | null => {
    const configIndex = configs.findIndex(c => c.id === id);
    if (configIndex === -1) return null;
    
    configs[configIndex] = { 
      ...configs[configIndex], 
      ...configData,
      updatedAt: new Date().toISOString()
    };
    return configs[configIndex];
  },

  deleteConfig: (id: string): boolean => {
    const configIndex = configs.findIndex(c => c.id === id);
    if (configIndex === -1) return false;
    
    configs.splice(configIndex, 1);
    return true;
  },

  // Admin stats method
  getAdminStats: (): AdminStats => {
    const totalParticipants = participants.length;
    const totalAttempts = quizzes.reduce((sum, quiz) => sum + quiz.attempts.length, 0);
    
    const averageScore = totalAttempts > 0 
      ? quizzes.reduce((sum, quiz) => 
          sum + quiz.attempts.reduce((s, a) => s + a.score, 0), 0
        ) / totalAttempts
      : 0;

    return {
      totalQuizzes: quizzes.length,
      totalParticipants,
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100
    };
  },
};
