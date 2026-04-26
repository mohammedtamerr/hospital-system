/* ============================================
   i18n.js - مستشفى النور التخصصي
   Bilingual System: Arabic (RTL) / English (LTR)
   ============================================ */

const I18n = (() => {

  let _lang = localStorage.getItem('hospital_lang') || 'ar';

  // ─────────────────────────────────────────
  //  ALL TRANSLATIONS
  // ─────────────────────────────────────────
  const T = {
    ar: {
      // App
      appName:     'مستشفى النور التخصصي',
      appSub:      'نظام الإدارة المتكاملة',
      systemName:  'النور التخصصي',
      systemSub:   'نظام الإدارة',

      // Auth
      email:          'البريد الإلكتروني',
      password:       'كلمة المرور',
      login:          'تسجيل الدخول',
      logout:         'تسجيل الخروج',
      switchLang:     'English',
      demoData:       'بيانات تجريبية:',
      loggingIn:      'جاري الدخول...',
      loginSuccess:   'مرحباً! تم تسجيل الدخول بنجاح',
      loginError:     'تعذر الاتصال بالخادم. تأكد من تشغيل XAMPP',
      loginRequired:  'يرجى إدخال البريد وكلمة المرور',

      // Navigation
      dashboard:    'لوحة التحكم',
      appointments: 'المواعيد',
      patients:     'المرضى',
      doctors:      'الأطباء',
      departments:  'الأقسام',
      messages:     'الرسائل',
      news:         'الأخبار',
      main:         'الرئيسية',
      management:   'إدارة المستشفى',
      communication:'التواصل والمحتوى',

      // Page subtitles
      dashSub:   'نظرة عامة على المستشفى',
      apptSub:   'إدارة مواعيد المرضى',
      patSub:    'سجلات المرضى',
      docSub:    'فريق الأطباء',
      deptSub:   'الأقسام الطبية',
      msgSub:    'رسائل التواصل',
      newsSub:   'أخبار المستشفى',

      // Stats
      totalPatients:    'إجمالي المرضى',
      activeDoctors:    'الأطباء النشطين',
      todayAppts:       'مواعيد اليوم',
      pendingAppts:     'مواعيد معلقة',
      occupiedRooms:    'غرف مشغولة',
      newMessages:      'رسائل جديدة',
      activeDepts:      'الأقسام النشطة',

      // Dashboard
      recentAppts:  'آخر المواعيد',
      dutyDoctors:  'أطباء المناوبة',
      recentMsgs:   'آخر الرسائل',
      viewAll:      'عرض الكل',

      // Appointments
      newAppt:         'موعد جديد',
      bookAppt:        'حجز موعد جديد',
      apptSchedule:    'جدول المواعيد',
      doctor:          'الطبيب',
      dept:            'القسم',
      date:            'التاريخ',
      time:            'الوقت',
      status:          'الحالة',
      type:            'النوع',
      actions:         'إجراءات',
      patientGuest:    'المريض/الزائر',
      selectDoctor:    'اختر الطبيب...',
      selectDept:      'اختر القسم...',
      visitType:       'نوع الزيارة',
      newVisit:        'زيارة جديدة',
      followUp:        'متابعة',
      guestName:       'اسم الزائر *',
      guestPhone:      'هاتف الزائر *',
      notes:           'ملاحظات',
      additionalInfo:  'أي معلومات إضافية...',
      bookBtn:         'حجز الموعد',
      updateAppt:      'تحديث الموعد',
      newStatus:       'الحالة الجديدة',
      updateApptBtn:   'حفظ التحديث',

      // Status labels
      pending:    'معلق',
      confirmed:  'مؤكد',
      completed:  'مكتمل',
      cancelled:  'ملغي',
      allStatuses:'كل الحالات',

      // Patients
      addPatient:    'إضافة مريض',
      addNewPatient: 'إضافة مريض جديد',
      patientRecord: 'سجل المرضى',
      patientFile:   'ملف المريض',
      nameAr:        'الاسم بالعربية *',
      nameEn:        'الاسم بالإنجليزية',
      gender:        'الجنس *',
      male:          'ذكر',
      female:        'أنثى',
      nationalId:    'رقم الهوية الوطنية',
      phone:         'الهاتف *',
      emailLabel:    'البريد الإلكتروني',
      dob:           'تاريخ الميلاد',
      bloodType:     'فصيلة الدم',
      address:       'العنوان',
      allergies:     'الحساسية',
      chronic:       'الأمراض المزمنة',
      emergencyName: 'اسم جهة الطوارئ',
      emergencyPhone:'هاتف الطوارئ',
      notSpecified:  'غير محدد',
      basicInfo:     'البيانات الأساسية',
      medicalInfo:   'المعلومات الطبية',
      addPatientBtn: 'إضافة المريض',
      medicalRecords:'السجلات الطبية',
      noRecords:     'لا توجد سجلات طبية',
      diagnosis:     'التشخيص',
      treatment:     'العلاج',
      prescription:  'الوصفة الطبية',

      // Doctors
      specialty:       'التخصص',
      experience:      'سنوات الخبرة',
      rating:          'التقييم',
      years:           'سنوات',
      available:       'متاح',
      allDepts:        'كل الأقسام',

      // Departments
      floor:       'الطابق',
      ground:      'الأرضي',

      // Messages
      contactMsgs:  'رسائل التواصل',
      sender:       'المرسل',
      subject:      'الموضوع',
      message:      'الرسالة',
      allMessages:  'كل الرسائل',
      newMsg:       'جديدة',
      read:         'مقروءة',
      replied:      'تم الرد',
      markRead:     'قراءة',

      // News
      newArticle:   'خبر جديد',
      addNews:      'إضافة خبر جديد',
      titleAr:      'العنوان بالعربية *',
      titleEn:      'العنوان بالإنجليزية',
      category:     'التصنيف',
      imageUrl:     'رابط الصورة',
      content:      'المحتوى *',
      publishNow:   'النشر الفوري',
      publishYes:   'نعم - نشر الآن',
      publishNo:    'لا - حفظ كمسودة',
      publishBtn:   'نشر الخبر',

      // Actions
      cancel:   'إلغاء',
      save:     'حفظ',
      edit:     'تعديل',
      delete:   'حذف',
      confirm:  'تأكيد',
      search:   'بحث...',
      searchName:  'بحث بالاسم أو الهاتف...',
      searchDoc:   'بحث بالاسم أو التخصص...',

      // Toast messages
      apptBooked:       'تم حجز الموعد بنجاح!',
      apptUpdated:      'تم تحديث الموعد',
      apptCancelled:    'تم إلغاء الموعد',
      patientAdded:     'تم إضافة المريض بنجاح',
      newsPublished:    'تم نشر الخبر بنجاح',
      msgMarkedRead:    'تم وضع علامة مقروء',
      loggedOut:        'تم تسجيل الخروج',

      // Errors
      fillRequired:   'يرجى تعبئة الحقول المطلوبة',
      guestRequired:  'يرجى إدخال اسم وهاتف الزائر',
      newsRequired:   'يرجى إدخال العنوان والمحتوى',
      serverError:    'تعذر الاتصال بالخادم',
      loadError:      'تعذر تحميل البيانات',

      // Empty states
      noAppts:     'لا توجد مواعيد',
      noPatients:  'لا توجد نتائج',
      noDoctors:   'لا توجد أطباء',
      noDepts:     'لا توجد أقسام',
      noMessages:  'لا توجد رسائل',
      noNews:      'لا توجد أخبار',
      loading:     'جاري التحميل...',

      // Roles
      admin:          'مدير النظام',
      doctor_role:    'طبيب',
      nurse:          'ممرض/ة',
      receptionist:   'موظف استقبال',

      // Confirm
      cancelApptConfirm: 'هل تريد إلغاء هذا الموعد؟',

      // Number label
      hash: '#',
    },

    en: {
      appName:    'Al-Nour Specialist Hospital',
      appSub:     'Integrated Management System',
      systemName: 'Al-Nour Hospital',
      systemSub:  'Management System',

      email:         'Email Address',
      password:      'Password',
      login:         'Sign In',
      logout:        'Logout',
      switchLang:    'عربي',
      demoData:      'Demo credentials:',
      loggingIn:     'Signing in...',
      loginSuccess:  'Welcome! Signed in successfully',
      loginError:    'Cannot connect to server. Make sure XAMPP is running.',
      loginRequired: 'Please enter your email and password',

      dashboard:    'Dashboard',
      appointments: 'Appointments',
      patients:     'Patients',
      doctors:      'Doctors',
      departments:  'Departments',
      messages:     'Messages',
      news:         'News',
      main:         'Main',
      management:   'Hospital Management',
      communication:'Communication',

      dashSub:   'Hospital overview',
      apptSub:   'Manage patient appointments',
      patSub:    'Patient registry',
      docSub:    'Medical team',
      deptSub:   'Medical departments',
      msgSub:    'Contact messages',
      newsSub:   'Hospital news',

      totalPatients: 'Total Patients',
      activeDoctors: 'Active Doctors',
      todayAppts:    "Today's Appointments",
      pendingAppts:  'Pending Appointments',
      occupiedRooms: 'Occupied Rooms',
      newMessages:   'New Messages',
      activeDepts:   'Active Departments',

      recentAppts: 'Recent Appointments',
      dutyDoctors: 'On-Duty Doctors',
      recentMsgs:  'Recent Messages',
      viewAll:     'View All',

      newAppt:      'New Appointment',
      bookAppt:     'Book New Appointment',
      apptSchedule: 'Appointments Schedule',
      doctor:       'Doctor',
      dept:         'Dept.',
      date:         'Date',
      time:         'Time',
      status:       'Status',
      type:         'Type',
      actions:      'Actions',
      patientGuest: 'Patient/Guest',
      selectDoctor: 'Select Doctor...',
      selectDept:   'Select Department...',
      visitType:    'Visit Type',
      newVisit:     'New Visit',
      followUp:     'Follow-up',
      guestName:    'Guest Name *',
      guestPhone:   'Guest Phone *',
      notes:        'Notes',
      additionalInfo: 'Any additional information...',
      bookBtn:      'Book Appointment',
      updateAppt:   'Update Appointment',
      newStatus:    'New Status',
      updateApptBtn:'Save Update',

      pending:    'Pending',
      confirmed:  'Confirmed',
      completed:  'Completed',
      cancelled:  'Cancelled',
      allStatuses:'All Statuses',

      addPatient:    'Add Patient',
      addNewPatient: 'Add New Patient',
      patientRecord: 'Patient Registry',
      patientFile:   'Patient Record',
      nameAr:        'Name in Arabic *',
      nameEn:        'Name in English',
      gender:        'Gender *',
      male:          'Male',
      female:        'Female',
      nationalId:    'National ID',
      phone:         'Phone *',
      emailLabel:    'Email',
      dob:           'Date of Birth',
      bloodType:     'Blood Type',
      address:       'Address',
      allergies:     'Allergies',
      chronic:       'Chronic Diseases',
      emergencyName: 'Emergency Contact Name',
      emergencyPhone:'Emergency Phone',
      notSpecified:  'Not specified',
      basicInfo:     'Basic Information',
      medicalInfo:   'Medical Information',
      addPatientBtn: 'Add Patient',
      medicalRecords:'Medical Records',
      noRecords:     'No medical records found',
      diagnosis:     'Diagnosis',
      treatment:     'Treatment',
      prescription:  'Prescription',

      specialty:  'Specialty',
      experience: 'Years of Experience',
      rating:     'Rating',
      years:      'years',
      available:  'Available',
      allDepts:   'All Departments',

      floor:  'Floor',
      ground: 'Ground Floor',

      contactMsgs: 'Contact Messages',
      sender:      'Sender',
      subject:     'Subject',
      message:     'Message',
      allMessages: 'All Messages',
      newMsg:      'New',
      read:        'Read',
      replied:     'Replied',
      markRead:    'Mark Read',

      newArticle:  'New Article',
      addNews:     'Add New Article',
      titleAr:     'Arabic Title *',
      titleEn:     'English Title',
      category:    'Category',
      imageUrl:    'Image URL',
      content:     'Content *',
      publishNow:  'Immediate Publish',
      publishYes:  'Yes - Publish Now',
      publishNo:   'No - Save as Draft',
      publishBtn:  'Publish Article',

      cancel:   'Cancel',
      save:     'Save',
      edit:     'Edit',
      delete:   'Delete',
      confirm:  'Confirm',
      search:   'Search...',
      searchName: 'Search by name or phone...',
      searchDoc:  'Search by name or specialty...',

      apptBooked:    'Appointment booked successfully!',
      apptUpdated:   'Appointment updated',
      apptCancelled: 'Appointment cancelled',
      patientAdded:  'Patient added successfully',
      newsPublished: 'Article published successfully',
      msgMarkedRead: 'Marked as read',
      loggedOut:     'Signed out',

      fillRequired:  'Please fill in all required fields',
      guestRequired: 'Please enter guest name and phone',
      newsRequired:  'Please enter title and content',
      serverError:   'Cannot connect to server',
      loadError:     'Failed to load data',

      noAppts:    'No appointments found',
      noPatients: 'No results found',
      noDoctors:  'No doctors found',
      noDepts:    'No departments found',
      noMessages: 'No messages found',
      noNews:     'No news found',
      loading:    'Loading...',

      admin:        'System Admin',
      doctor_role:  'Doctor',
      nurse:        'Nurse',
      receptionist: 'Receptionist',

      cancelApptConfirm: 'Are you sure you want to cancel this appointment?',

      hash: '#',
    }
  };

  // ─────────────────────────────────────────
  //  GET TRANSLATION
  // ─────────────────────────────────────────
  function t(key) {
    return T[_lang]?.[key] ?? T['ar']?.[key] ?? key;
  }

  // ─────────────────────────────────────────
  //  APPLY LANGUAGE TO DOM
  // ─────────────────────────────────────────
  function apply(lang) {
    _lang = lang;
    localStorage.setItem('hospital_lang', lang);

    const html = document.documentElement;
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Translate all [data-ar] / [data-en] elements
    document.querySelectorAll('[data-ar]').forEach(el => {
      const txt = el.getAttribute(`data-${lang}`);
      if (txt) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = txt;
        } else {
          el.textContent = txt;
        }
      }
    });

    // Translate placeholders [data-ar-placeholder] / [data-en-placeholder]
    document.querySelectorAll(`[data-${lang}-placeholder]`).forEach(el => {
      el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });

    // Update lang toggle buttons
    const other = lang === 'ar' ? 'English' : 'عربي';
    document.querySelectorAll('#langBtn, #langLabel, #topLangLabel').forEach(el => {
      el.textContent = el.id === 'topLangLabel'
        ? (lang === 'ar' ? 'EN' : 'AR')
        : other;
    });

    // Page title update
    const titleEl = document.querySelector('title');
    if (titleEl) {
      titleEl.textContent = t('appName');
    }

    // Update page subtitle if visible
    const sub = document.getElementById('pageSubtitle');
    if (sub && window._currentPage) {
      const subKey = window._currentPage + 'Sub';
      sub.textContent = t(subKey) || '';
    }
  }

  // ─────────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────────
  function init() {
    apply(_lang);
  }

  // ─────────────────────────────────────────
  //  PUBLIC
  // ─────────────────────────────────────────
  return {
    t,
    apply,
    init,
    getLang: () => _lang,
    isAr:    () => _lang === 'ar',
    isEn:    () => _lang === 'en',
  };

})();

// Global shorthand
const t = (key) => I18n.t(key);

function toggleLang() {
  const next = I18n.getLang() === 'ar' ? 'en' : 'ar';
  I18n.apply(next);
}
