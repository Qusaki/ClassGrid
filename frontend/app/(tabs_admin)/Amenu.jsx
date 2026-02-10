import { useNavigation } from "@react-navigation/native";
import { useState } from 'react';
import { Alert, FlatList, ImageBackground, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const HeaderDropdownMenu = ({ options, onSelect, onLogout }) => {
  const navigation = useNavigation();
  const handleLogout = () => {
    setVisible(false);
    if (onLogout) {
      onLogout();
    }
    setTimeout(() => {
      alert("You have logged out!");
    }, 300);
    navigation.navigate("index");
  };
  const [visible, setVisible] = useState(false);
  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
  };
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>{visible ? "MENU ▲" : "MENU ▼"}</Text>
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

const InstructorsList = ({ instructors, onSelectInstructor, onDeleteInstructor }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Actions</Text>
      </View>
      {instructors.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No instructors available.</Text>
      ) : (
        instructors.map((instructor) => (
          <View key={instructor.id} style={styles.tableRow}>
            <TouchableOpacity
              style={[styles.tableCell, { flex: 2 }]}
              onPress={() => onSelectInstructor(instructor.name)}
            >
              <Text style={styles.tableCellText}>{instructor.name}</Text>
            </TouchableOpacity>
            <View style={[styles.tableCell, styles.actionsCell]}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ff4d4d' }]}
                onPress={() => onDeleteInstructor(instructor.id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const InstructorSchedule = ({ instructorName, schedule, onBack }) => {
  const instructorSchedule = schedule.filter(item => item.instructor === instructorName);
  return (
    <View>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Instructors</Text>
      </TouchableOpacity>
      <Text style={styles.scheduleTitle}>{instructorName}'s Schedule</Text>
      {instructorSchedule.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic', color: 'white' }}>
          No schedule entries for {instructorName}.
        </Text>
      ) : (
        <View style={styles.courseScheduleTableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell]}>Subject</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Time</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Room</Text>
          </View>
          {instructorSchedule.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.subject}</Text>
              <Text style={styles.tableCell}>{item.time}</Text>
              <Text style={styles.tableCell}>{item.room}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const CreateUserForm = ({ onSave, onCancel }) => {
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [lastname, setLastname] = useState('');
  const [gmail, setGmail] = useState('');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = () => {
    if (!firstname.trim() || !lastname.trim() || !gmail.trim() || !userid.trim() || !password.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    const fullName = `${firstname.trim()} ${middlename.trim()} ${lastname.trim()}`.trim();
    onSave({ name: fullName, gmail: gmail.trim(), userid: userid.trim(), password: password.trim() });
    Alert.alert("Success", "Information is submitted successfully.");
    setFirstname('');
    setMiddlename('');
    setLastname('');
    setGmail('');
    setUserid('');
    setPassword('');
  };

  return (
    <View style={styles.createUserContainer}>
      <Text style={styles.scheduleTitle}>Create User</Text>
      <TextInput
        placeholder="Firstname"
        value={firstname}
        onChangeText={setFirstname}
        style={styles.input}
      />
      <TextInput
        placeholder="Middlename"
        value={middlename}
        onChangeText={setMiddlename}
        style={styles.input}
      />
      <TextInput
        placeholder="Lastname"
        value={lastname}
        onChangeText={setLastname}
        style={styles.input}
      />
      <TextInput
        placeholder="Gmail Account"
        value={gmail}
        onChangeText={setGmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="UserID"
        value={userid}
        onChangeText={setUserid}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#aaa' }]} onPress={onCancel}>
          <Text style={styles.saveButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const UsernamePasswordList = ({ instructors }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>UserID</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Password</Text>
      </View>
      {instructors.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No users available.</Text>
      ) : (
        instructors.map((instructor) => (
          <View key={instructor.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{instructor.name}</Text>
            <Text style={styles.tableCell}>{instructor.userid || 'N/A'}</Text>
            <Text style={styles.tableCell}>{instructor.password || 'N/A'}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const UsersRequestList = ({ instructors }) => {
  return (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>UserID</Text>
      </View>
      {instructors.length === 0 ? (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>No user requests available.</Text>
      ) : (
        instructors.map((instructor) => (
          <View key={instructor.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{instructor.name}</Text>
            <Text style={styles.tableCell}>{instructor.userid || 'N/A'}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const DropdownExample = () => {
  const [headerSelection, setHeaderSelection] = useState(null);
  const [schedule, setSchedule] = useState([
    { instructor: 'Iratus Glenn Cruz', subject: 'Software Engineering', time: '8:00 AM - 9:00 AM', room: 'Computer lab' },
    { instructor: 'Michael G. Albino', subject: 'Information Management', time: '9:00 AM - 10:00 AM', room: 'Hybrid Lab' },
  ]);
  const [instructors, setInstructors] = useState([
    { id: '1', name: 'Marie Celia Aglibot', gmail: 'marie@example.com', userid: 'user1', password: 'pass1' },
    { id: '2', name: 'Michael Albino', gmail: 'michael@example.com', userid: 'user2', password: 'pass2' },
    { id: '3', name: 'Iratus Glenn Cruz', gmail: 'iratus@example.com', userid: 'user3', password: 'pass3' },
    { id: '4', name: 'Donnel Tongoy', gmail: 'donnel@example.com', userid: 'user4', password: 'pass4' },
  ]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const headerOptions = [
    { label: 'Instructors', value: 'Instructors' },
    { label: 'Create User', value: 'Create User' },
    { label: 'Username and Password', value: 'Username and Password' },
    { label: 'Users Request', value: 'Users Request' },
    { label: 'Logout', value: 'Logout' },
  ];

  const showInstructors = headerSelection === 'Instructors';
  const showCreateUser = headerSelection === 'Create User';
  const showUsernamePassword = headerSelection === 'Username and Password';
  const showUsersRequest = headerSelection === 'Users Request';

  const handleSelectInstructor = (instructorName) => {
    setSelectedInstructor(instructorName);
  };

  const handleBackToInstructors = () => {
    setSelectedInstructor(null);
  };

  const handleDeleteInstructor = (id) => {
    setInstructors(instructors.filter(instructor => instructor.id !== id));
  };

  const handleSaveUser = (user) => {
    const newId = (instructors.length + 1).toString();
    setInstructors([...instructors, { id: newId, name: user.name, gmail: user.gmail, userid: user.userid, password: user.password }]);
    setHeaderSelection(null);
  };

  const handleCancelCreateUser = () => {
    setHeaderSelection(null);
  };

  const resetState = () => {
    setHeaderSelection(null);
    setSchedule([
      { instructor: 'Iratus Glenn Cruz', subject: 'Software Engineering', time: '8:00 AM - 9:00 AM', room: 'Computer lab' },
      { instructor: 'Michael G. Albino', subject: 'Information Management', time: '9:00 AM - 10:00 AM', room: 'Hybrid Lab' },
    ]);
    // Removed setInstructors to preserve created users
    setSelectedInstructor(null);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg', // Replace with your actual background image URL
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.container}>
        <HeaderDropdownMenu options={headerOptions} onSelect={setHeaderSelection} onLogout={resetState} />
        {headerSelection && (
          <Text style={styles.selectedText}>Selected Menu: {headerSelection}</Text>
        )}

        {showInstructors && (
          <>
            <Text style={styles.scheduleTitle}>Instructors</Text>
            {selectedInstructor ? (
              <InstructorSchedule
                instructorName={selectedInstructor}
                schedule={schedule}
                onBack={handleBackToInstructors}
              />
            ) : (
              <InstructorsList
                instructors={instructors}
                onSelectInstructor={handleSelectInstructor}
                onDeleteInstructor={handleDeleteInstructor}
              />
            )}
          </>
        )}

        {showCreateUser && (
          <CreateUserForm onSave={handleSaveUser} onCancel={handleCancelCreateUser} />
        )}

        {showUsernamePassword && (
          <>
            <Text style={styles.scheduleTitle}>Username and Password</Text>
            <UsernamePasswordList instructors={instructors} />
          </>
        )}

        {showUsersRequest && (
          <>
            <Text style={styles.scheduleTitle}>Users Request</Text>
            <UsersRequestList instructors={instructors} />
          </>
        )}
      </View>
    </ImageBackground>
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
  },
  tableCellText: {
    fontSize: 16,
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  courseScheduleTableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    minWidth: 300,
  },
  createUserContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    marginTop: 10,
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
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DropdownExample;