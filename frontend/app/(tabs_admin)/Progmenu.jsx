import { useNavigation } from "@react-navigation/native";
import { useState } from 'react';
import { FlatList, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const HeaderDropdownMenu = ({ options, onSelect }) => {
  const navigation = useNavigation();
  const handleLogout = () => {
    setVisible(false);
    setTimeout(() => {
      alert("You have logged out!");
    }, 300);
    navigation.navigate("index");
  }
  const [visible, setVisible] = useState(false);
  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
  };
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>{visible ? "Menu ▲" : "Menu ▼"}</Text>
      </TouchableOpacity>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdownMenu}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed, hovered }) => [
                    styles.menuItem,
                    (pressed || hovered) && { backgroundColor: '#e0e0e0' }
                  ]}
                  onPress={() => {
                    if (item.value === "Logout") {
                      handleLogout();
                    } else {
                      handleSelect(item.value);
                      setVisible(false);
                    }
                  }}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


const RoomList = ({ rooms, onSelectRoom }) => {
  return (
    <View style={styles.roomListContainer}>
      <Text style={styles.roomListTitle}>Select a Room</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomButton} onPress={() => onSelectRoom(item)}>
            <Text style={styles.roomButtonText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const ScheduleDetailModal = ({ visible, onClose, schedule }) => {
  if (!schedule) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.tableContainer}>
              <Text style={styles.detailLabel}>Subject Code: {schedule.subjectCode || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Subject Description: {schedule.subjectDescription || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Instructor: {schedule.instructor || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Room: {schedule.room || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Units: {schedule.units || 'N/A'}</Text>
              <Text style={styles.detailLabel}>Schedule (Date & Time): {schedule.schedules ? schedule.schedules.join('; ') : 'N/A'}</Text>
              <Text style={styles.detailLabel}>Section: {schedule.section || 'N/A'}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const InstructorScheduleModal = ({ visible, onClose, instructorSchedules }) => {
  if (!visible || !instructorSchedules) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Instructor Schedules</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {instructorSchedules.map((schedule, index) => (
              <View key={index} style={styles.tableContainer}>
                <Text style={styles.detailLabel}>Subject Code: {schedule.subjectCode || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Subject Description: {schedule.subjectDescription || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Instructor: {schedule.instructor || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Room: {schedule.room || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Units: {schedule.units || 'N/A'}</Text>
                <Text style={styles.detailLabel}>Schedule (Date & Time): {schedule.schedules ? schedule.schedules.join('; ') : 'N/A'}</Text>
                <Text style={styles.detailLabel}>Section: {schedule.section || 'N/A'}</Text>
                <View style={styles.separator} />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const RoomScheduleTable = ({ roomSchedules }) => {
  return (
    <ScrollView horizontal>
      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell]}>Room</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Subject Code</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Schedule</Text>
        </View>
        {Object.entries(roomSchedules).map(([room, entries]) =>
          entries.map((entry, idx) => (
            <View key={`${room}-${idx}`} style={styles.tableRow}>
              {idx === 0 && (
                <Text style={styles.tableCell} rowSpan={entries.length}>
                  {room}
                </Text>
              )}
              <Text style={styles.tableCell}>{entry.subjectCode}</Text>
              <Text style={styles.tableCell}>{entry.schedule}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const ScheduleModal = ({ visible, onClose, onSave, initialData }) => {
  const [instructor, setInstructor] = useState(initialData?.instructor || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [room, setRoom] = useState(initialData?.room || '');

  const handleSave = () => {
    if (!instructor.trim() || !subject.trim() || !time.trim() || !room.trim()) {
      alert('Please fill in Instructor, Subject, Time, and Room.');
      return;
    }
    onSave({ instructor: instructor.trim(), subject: subject.trim(), time: time.trim(), room: room.trim() });
    setInstructor('');
    setSubject('');
    setTime('');
    setRoom('');
  };

  const handleClose = () => {
    setInstructor('');
    setSubject('');
    setTime('');
    setRoom('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{initialData ? 'Edit Entry' : 'Add Entry'}</Text>
          <TextInput
            placeholder="Instructor"
            value={instructor}
            onChangeText={setInstructor}
            style={styles.input}
          />
          <TextInput
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />
          <TextInput
            placeholder="Time"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />
          <TextInput
            placeholder="Room"
            value={room}
            onChangeText={setRoom}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InstructorsList = ({ instructors }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
      </View>
      {instructors.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No instructors available.</Text>
      ) : (
        instructors.map((instructor) => (
          <View key={instructor.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{instructor.name}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const SubjectList = ({ subjects }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Code</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Description</Text>
      </View>
      {subjects.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No subjects available.</Text>
      ) : (
        subjects.map((subject) => (
          <View key={subject.code} style={styles.tableRow}>
            <Text style={styles.tableCell}>{subject.code}</Text>
            <Text style={styles.tableCell}>{subject.description}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const SectionList = ({ sections }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Section</Text>
      </View>
      {sections.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No sections available.</Text>
      ) : (
        sections.map((section) => (
          <View key={section} style={styles.tableRow}>
            <Text style={styles.tableCell}>{section}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const CreateScheduleForm = ({ onSave, existingSchedules = [] }) => {
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [units, setUnits] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [section, setSection] = useState('');
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [instructorModalVisible, setInstructorModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const subjects = [
    { code: 'CC101', description: 'Introduction to Computer Science' },
    { code: 'CC106', description: 'Data Structures' },
    { code: 'AL101', description: 'Algorithms and Complexity' },
    { code: 'SE101', description: 'Software Engineering 1' },
    { code: 'CC105', description: 'Information Management' },
  ];

  const instructors = [
    { id: '1', name: 'Marie Celia Aglibot' },
    { id: '2', name: 'Michael Albino' },
    { id: '3', name: 'Iratus Glenn Cruz' },
    { id: '4', name: 'Donnel Tongoy' },
  ];

  const rooms = ['Computer lab', 'Hybrid Lab', 'Classroom 101', 'Classroom 102'];

  const sections = ['BSCS 1A', 'BSCS 2A', 'BSCS 3A', 'BSCS 4A'];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubjectCodeChange = (code) => {
    setSubjectCode(code);
    const subject = subjects.find(s => s.code === code);
    setSubjectDescription(subject ? subject.description : '');
    setSubjectModalVisible(false);
  };

  const handleRoomSelect = (selectedRoom) => {
    setRoom(selectedRoom);
    setRoomModalVisible(false);
  };

  const addSchedule = () => {
    if (!selectedDay || !startTime || !endTime) {
      alert('Please select day, start time, and end time.');
      return;
    }
    const newSchedule = `${selectedDay}, ${startTime}-${endTime}`;
    setSchedules([...schedules, newSchedule]);
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
    setScheduleModalVisible(false);
  };

  const removeSchedule = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!subjectCode.trim() || !subjectDescription.trim() || !instructor || !room || !units || schedules.length === 0 || !section) {
      alert('Please fill in all fields and add at least one schedule.');
      return;
    }
    onSave({
      subjectCode: subjectCode.trim(),
      subjectDescription: subjectDescription.trim(),
      instructor,
      room,
      units: parseInt(units),
      schedules,
      section,
    });
    // Reset fields
    setSubjectCode('');
    setSubjectDescription('');
    setInstructor('');
    setRoom('');
    setUnits('');
    setSchedules([]);
    setSection('');
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Schedule</Text>

      <TouchableOpacity style={styles.dropdown} onPress={() => setSubjectModalVisible(true)}>
        <Text style={styles.dropdownText}>{subjectCode || 'Select Subject Code'}</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Subject Description"
        value={subjectDescription}
        editable={false}
        style={styles.input}
      />

      <TouchableOpacity style={styles.dropdown} onPress={() => setInstructorModalVisible(true)}>
        <Text style={styles.dropdownText}>{instructor || 'Select Instructor'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dropdown} onPress={() => setRoomModalVisible(true)}>
        <Text style={styles.dropdownText}>{room || 'Select Room'}</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Units"
        value={units}
        onChangeText={setUnits}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Schedules:</Text>
      {schedules.map((sched, index) => (
        <View key={index} style={styles.scheduleItem}>
          <Text style={styles.scheduleText}>{sched}</Text>
          <TouchableOpacity style={styles.removeScheduleButton} onPress={() => removeSchedule(index)}>
            <Text style={styles.removeScheduleText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addScheduleButton} onPress={() => setScheduleModalVisible(true)}>
        <Text style={styles.addScheduleText}>Add Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dropdown} onPress={() => setSectionModalVisible(true)}>
        <Text style={styles.dropdownText}>{section || 'Select Section'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Schedule</Text>
      </TouchableOpacity>

      {/* Subject Modal */}
      <Modal visible={subjectModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject Code</Text>
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => handleSubjectCodeChange(item.code)}>
                  <Text style={styles.menuItemText}>{item.code} - {item.description}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#aaa' }]} onPress={() => setSubjectModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Instructor Modal */}
      <Modal visible={instructorModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Instructor</Text>
            <FlatList
              data={instructors}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => { setInstructor(item.name); setInstructorModalVisible(false); }}>
                  <Text style={styles.menuItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#aaa' }]} onPress={() => setInstructorModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Room Modal */}
      <Modal visible={roomModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Room</Text>
            <FlatList
              data={rooms}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => handleRoomSelect(item)}>
                  <Text style={styles.menuItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#aaa' }]} onPress={() => setRoomModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Section Modal */}
      <Modal visible={sectionModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Section</Text>
            <FlatList
              data={sections}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => { setSection(item); setSectionModalVisible(false); }}>
                  <Text style={styles.menuItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#aaa' }]} onPress={() => setSectionModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={scheduleModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Schedule</Text>
            <Text style={styles.label}>Select Day:</Text>
            <FlatList
              data={days}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => setSelectedDay(item)}>
                  <Text style={[styles.menuItemText, selectedDay === item && { color: 'blue' }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TextInput
              placeholder="Start Time (e.g., 8:00am)"
              value={startTime}
              onChangeText={setStartTime}
              style={styles.input}
            />
            <TextInput
              placeholder="End Time (e.g., 9:00am)"
              value={endTime}
              onChangeText={setEndTime}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addSchedule}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#aaa' }]}
                onPress={() => {
                  setSelectedDay('');
                  setStartTime('');
                  setEndTime('');
                  setScheduleModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DropdownExample = () => {
  const [headerSelection, setHeaderSelection] = useState(null);
  const [schedule, setSchedule] = useState([
    { subjectCode: 'SE101', subjectDescription: 'Software Engineering', instructor: 'Iratus Glenn Cruz', room: 'Computer lab', units: 1, schedule: 'Monday, 8:00am-9:00am', section: 'A' },
    { subjectCode: 'IM101', subjectDescription: 'Information Management', instructor: 'Michael Albino', room: 'Hybrid Lab', units: 1, schedule: 'Tuesday, 9:00am-10:00am', section: 'B' },
  ]);
  const [instructors, setInstructors] = useState([
    { id: '1', name: 'Marie Celia Aglibot', department: 'Computer Science' },
    { id: '2', name: 'Michael Albino', department: 'Computer Science' },
    { id: '3', name: 'Iratus Glenn Cruz', department: 'Computer Science' },
    { id: '4', name: 'Donnel Tongoy', department: 'Information Technology' },
  ]);
  const [viewingAll, setViewingAll] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState(null);
  const [viewingInstructors, setViewingInstructors] = useState(false);
  const [addInstructorModalVisible, setAddInstructorModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); const [expandedInstructor, setExpandedInstructor] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [instructorScheduleModalVisible, setInstructorScheduleModalVisible] = useState(false);
  const [selectedInstructorSchedules, setSelectedInstructorSchedules] = useState([]);
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [addViewingModalVisible, setAddViewingModalVisible] = useState(false);
  const [editingViewing, setEditingViewing] = useState(null);
  const [viewingButtons, setViewingButtons] = useState([
    { id: '1', name: 'All instructors' },
  ]);

  const subjects = [
    { code: 'CS101', description: 'Introduction to Computer Science' },
    { code: 'CS102', description: 'Data Structures' },
    { code: 'CS103', description: 'Algorithms' },
    { code: 'SE101', description: 'Software Engineering' },
    { code: 'IM101', description: 'Information Management' },
  ];

  const rooms = ['Computer lab', 'Hybrid Lab', 'Classroom 101', 'Classroom 102'];

  const sections = ['A', 'B', 'C', 'D'];

  const headerOptions = [
    { label: 'Schedule List', value: 'Schedule List' },
    { label: 'Create Schedule', value: 'Create Schedule' },
    { label: 'Room List', value: 'Room List' },
    { label: 'Instructor List', value: 'Instructor List' },
    { label: 'Subject List', value: 'Subject List' },
    { label: 'Section List', value: 'Section List' },
    { label: 'Logout', value: 'Logout' },
  ];

  const showSchedule = headerSelection === 'Create Schedule';
  const showCourseSchedule = headerSelection === 'Schedule List';
  const showRoomSchedule = headerSelection === 'Room List';
  const showInstructors = headerSelection === 'Instructor List';
  const showSubjects = headerSelection === 'Subject List';
  const showSections = headerSelection === 'Section List';

  const openAddModal = () => {
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setModalVisible(true);
  };
  const [instructorsByViewing, setInstructorsByViewing] = useState({
    '1': [
      { id: '1', name: 'Marie Celia Aglibot' },
      { id: '2', name: 'Michael Albino' },
      { id: '3', name: 'Iratus Glenn Cruz' },
      { id: '4', name: 'Donnel Tongoy' },
    ],
  });

  const handleRemoveInstructor = (id) => {
    setInstructorsByViewing(prev => ({
      ...prev,
      [selectedViewing]: prev[selectedViewing]?.filter(inst => inst.id !== id) || [],
    }));
  };
  const handleAddInstructor = (name) => {
    const currentInstructors = instructorsByViewing[selectedViewing] || [];
    const newId = currentInstructors.length > 0 ? (Math.max(...currentInstructors.map(inst => parseInt(inst.id))) + 1).toString() : '1';
    setInstructorsByViewing(prev => ({
      ...prev,
      [selectedViewing]: [...(prev[selectedViewing] || []), { id: newId, name }],
    }));
    setAddInstructorModalVisible(false);
  };

  const handleRemoveViewing = (id) => {
    setViewingButtons(viewingButtons.filter(btn => btn.id !== id));
  };

  const handleAddViewing = (name) => {
    const newId = (Math.max(...viewingButtons.map(btn => parseInt(btn.id))) + 1).toString();
    setViewingButtons([...viewingButtons, { id: newId, name }]);
    setAddViewingModalVisible(false);
  };

  const handleEditViewing = (id, name) => {
    setViewingButtons(viewingButtons.map(btn => btn.id === id ? { ...btn, name } : btn));
    setEditingViewing(null);
  };

  const handleSaveEntry = (entry) => {
    if (editingIndex !== null) {
      const newSchedule = [...schedule];
      newSchedule[editingIndex] = entry;
      setSchedule(newSchedule);
    } else {
      setSchedule([...schedule, entry]);
    }
    setModalVisible(false);
  };

  const handleDeleteEntry = (index) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = (entry) => {
    setSchedule([...schedule, entry]);
  };

  const roomSchedules = schedule.reduce((acc, entry) => {
    if (!acc[entry.room]) acc[entry.room] = [];
    acc[entry.room].push({ subjectCode: entry.subjectCode, schedule: entry.schedule });
    return acc;
  }, {});

  const groupedSchedules = schedule.reduce((acc, s) => {
    if (!acc[s.instructor]) acc[s.instructor] = [];
    acc[s.instructor].push(s);
    return acc;
  }, {});

  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg',
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.container}>
        <HeaderDropdownMenu options={headerOptions} onSelect={setHeaderSelection} />
        {headerSelection && (
          <Text style={styles.selectedText}>Selected Menu: {headerSelection}</Text>
        )}

        {showSchedule && (
          <CreateScheduleForm
            onSave={handleSaveSchedule}
            existingSchedules={schedule}
            subjects={subjects}
            instructors={instructors.map(inst => ({ id: inst.id, name: inst.name }))}
            rooms={rooms}
            sections={sections}
          />
        )}

        {showCourseSchedule && (
          <>
            <Text style={styles.scheduleTitle}>Schedule List</Text>
            {viewingInstructor ? (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setViewingInstructor(null)}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.instructorTitle}>{viewingInstructor}'s Schedules</Text>
                <ScrollView horizontal>
                  <View style={styles.tableContainer}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, styles.headerCell]}>Subject Code</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Subject Description</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Room</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Units</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Schedule (Date & Time)</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Section</Text>
                    </View>
                    {schedule.filter(s => s.instructor === viewingInstructor).map((item, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.subjectCode}</Text>
                        <Text style={styles.tableCell}>{item.subjectDescription}</Text>
                        <Text style={styles.tableCell}>{item.room}</Text>
                        <Text style={styles.tableCell}>{item.units}</Text>
                        <Text style={styles.tableCell}>{item.schedule}</Text>
                        <Text style={styles.tableCell}>{item.section}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : (
              instructors.map((inst) => (
                <TouchableOpacity
                  key={inst.id}
                  style={styles.instructorButton}
                  onPress={() => setViewingInstructor(inst.name)}
                >
                  <Text style={styles.instructorButtonText}>{inst.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {showRoomSchedule && (
          <>
            <Text style={styles.scheduleTitle}>Room List</Text>
            {schedule.length === 0 ? (
              <Text style={{ padding: 10, fontStyle: 'italic', color: 'white' }}>
                No schedule entries.
              </Text>
            ) : (
              <RoomScheduleTable roomSchedules={roomSchedules} />
            )}
          </>
        )}

        {showInstructors && (
          <>
            <Text style={styles.scheduleTitle}>Instructor List</Text>
            {!selectedViewing && (
              <>
                {viewingButtons.map(button => (
                  <View key={button.id} style={styles.viewingButtonContainer}>
                    <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedViewing(button.id)}>
                      <Text style={styles.categoryButtonText}>{button.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditingViewing(button)}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveViewing(button.id)}>
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addButton} onPress={() => setAddViewingModalVisible(true)}>
                  <Text style={styles.addButtonText}>Add Viewing</Text>
                </TouchableOpacity>
              </>
            )}
            {selectedViewing && (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedViewing(null)}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                  <View style={styles.tableContainer}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, styles.headerCell]}>Instructor ID</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Instructor Name</Text>
                      <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
                    </View>
                    {instructorsByViewing[selectedViewing]?.map((inst) => (
                      <View key={inst.id} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{inst.id}</Text>
                        <Text style={styles.tableCell}>{inst.name}</Text>
                        <View style={[styles.tableCell, styles.actionsCell]}>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#ae2222ff' }]}
                            onPress={() => handleRemoveInstructor(inst.id)}
                          >
                            <Text style={styles.actionText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )) || <Text style={{ padding: 10, fontStyle: 'italic' }}>No instructors in this viewing.</Text>}
                  </View>
                </ScrollView>
                <TouchableOpacity style={styles.addButton} onPress={() => setAddInstructorModalVisible(true)}>
                  <Text style={styles.addButtonText}>Add Instructor</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}


        {showSubjects && (
          <>
            <Text style={styles.scheduleTitle}>Subject List</Text>
            <SubjectList subjects={subjects} />
          </>
        )}

        {showSections && (
          <>
            <Text style={styles.scheduleTitle}>Section List</Text>
            <SectionList sections={sections} />
          </>
        )}

        <ScheduleModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveEntry}
          initialData={editingIndex !== null ? schedule[editingIndex] : null}
        />

        <AddViewingModal
          visible={addViewingModalVisible}
          onClose={() => setAddViewingModalVisible(false)}
          onSave={handleAddViewing}
        />

        {editingViewing && (
          <EditViewingModal
            visible={!!editingViewing}
            onClose={() => setEditingViewing(null)}
            onSave={(name) => handleEditViewing(editingViewing.id, name)}
            initialName={editingViewing.name}
          />
        )}

        <AddInstructorModal
          visible={addInstructorModalVisible}
          onClose={() => {
            setAddInstructorModalVisible(false);
          }}
          onSave={handleAddInstructor}
        />
      </View>
    </ImageBackground>
  );
};
const AddInstructorModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter name.');
      return;
    }
    onSave(name.trim());
    setName('');
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Instructor</Text>
          <TextInput
            placeholder="Instructor Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddViewingModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    onSave(name.trim());
    setName('');
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Viewing</Text>
          <TextInput
            placeholder="Viewing Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const EditViewingModal = ({ visible, onClose, onSave, initialName }) => {
  const [name, setName] = useState(initialName || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    onSave(name.trim());
    setName('');
  };

  const handleClose = () => {
    setName(initialName || '');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Viewing</Text>
          <TextInput
            placeholder="Viewing Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#aaa' }]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 0,
    flex: 1,
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(119, 119, 118, 0.5)',
  },
  headerContainer: {
    marginBottom: 10,
  },
  headerButton: {
    marginTop: 15,
    backgroundColor: '#070707ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuItem: {
    padding: 15,
    borderBottomColor: '#000000ff',
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 10,
    color: 'black',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    minWidth: 300,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    backgroundColor: '#070707ff',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryButton: {
    backgroundColor: '#ffffffff',
    padding: 10,
    borderWidth: 5,
    borderRadius: 10,
    marginVertical: 10,
    alignText: 'left',
  },
  categoryButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructorButton: {
    backgroundColor: 'white',
    padding: 10,
    borderWidth: 5,
    borderRadius: 10,
    marginVertical: 10,
    alignText: 'left',
  },
  instructorButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },

  viewingButton: {
    backgroundColor: '#070707ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignText: 'center',
  },
  viewingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#070707ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  viewingButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: 'darkgreen',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  editButtonText: {
    color: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  scheduleText: {
    fontSize: 16,
    flex: 1,
  },
  removeScheduleButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  removeScheduleText: {
    color: 'white',
  },
  addScheduleButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 3,
    marginBottom: 15,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  addScheduleText: {
    color: 'white',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  removeButtonText: {
    color: 'white',
  },

  instructorTitle: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 5,
    alignSelf: 'flex-start',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  actionButton: {
    backgroundColor: '#070707ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  actionText: {
    color: 'white',
  },
  addButton: {
    marginTop: 15,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#165aedff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  roomListContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  roomListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  roomButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  roomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  courseScheduleTableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
  },
});

export default DropdownExample;

