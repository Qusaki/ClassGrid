import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import client from '../../api/client';
import { Alert, FlatList, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    navigation.navigate("index"); // "index" at root maps to "/" in Expo Router depending on setup, but explict "/" is safer if using router
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={item.icon} size={20} color="black" style={{ marginRight: 10 }} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const InstructorsList = ({ instructors, onSelectInstructor, onDeleteInstructor, onEditInstructor }) => {
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
                style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                onPress={() => onEditInstructor(instructor)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
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

const CreateUserForm = ({ onSave, onCancel, role = 'instructor', title = 'Create Instructor' }) => {
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [lastname, setLastname] = useState('');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  const departments = [
    { label: 'BSCS', value: 'BSCS' },
    { label: 'BSED-English', value: 'BSED-English' },
    { label: 'BSED-HR', value: 'BSED-HR' },
    { label: 'BSBA', value: 'BSBA' },
    { label: 'BEED', value: 'BEED' },
  ];

  const handleSave = () => {
    if (!firstname.trim() || !lastname.trim() || !userid.trim() || !password.trim() || !department) {
      alert('Please fill in all fields including Department.');
      return;
    }
    // Pass individual fields to match backend schema
    onSave({
      firstname: firstname.trim(),
      middlename: middlename.trim(),
      lastname: lastname.trim(),
      user_id: userid.trim(),
      password: password.trim(),
      role: role,
      department: department,
    });

    setFirstname('');
    setMiddlename('');
    setLastname('');
    setUserid('');
    setPassword('');
    setDepartment('');
  };

  return (
    <View style={styles.createUserContainer}>
      <Text style={styles.scheduleTitle}>{title}</Text>
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

      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
      >
        <Text style={{ color: department ? '#000' : '#888' }}>
          {department || 'Select Department'}
        </Text>
      </TouchableOpacity>

      {isDeptDropdownOpen && (
        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, backgroundColor: '#f9f9f9' }}>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept.value}
              style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
              onPress={() => {
                setDepartment(dept.value);
                setIsDeptDropdownOpen(false);
              }}
            >
              <Text>{dept.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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

const EditUserForm = ({ user, onSave, onCancel }) => {
  const [firstname, setFirstname] = useState(user.firstname);
  const [middlename, setMiddlename] = useState(user.middlename || '');
  const [lastname, setLastname] = useState(user.lastname);
  const [password, setPassword] = useState(''); // Leave blank to keep current

  const handleSave = () => {
    if (!firstname.trim() || !lastname.trim()) {
      alert('Firstname and Lastname are required.');
      return;
    }
    const updatedData = {
      firstname: firstname.trim(),
      middlename: middlename.trim(),
      lastname: lastname.trim(),
      role: user.role, // Keep existing role
    };
    if (password.trim()) {
      updatedData.password = password.trim();
    }
    onSave(user.user_id, updatedData);
  };

  return (
    <View style={styles.createUserContainer}>
      <Text style={styles.scheduleTitle}>Edit User</Text>
      <Text style={{ marginBottom: 10, color: '#666' }}>UserID: {user.user_id} (Cannot be changed)</Text>
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
        placeholder="New Password (leave blank to keep)"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#aaa' }]} onPress={onCancel}>
          <Text style={styles.saveButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ViewInfoList = ({ instructors }) => {
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
          <View key={instructor.user_id} style={styles.tableRow}>
            {/* Combine names for display */}
            <Text style={styles.tableCell}>{`${instructor.firstname} ${instructor.middlename ? instructor.middlename + ' ' : ''}${instructor.lastname}`}</Text>
            <Text style={styles.tableCell}>{instructor.user_id || 'N/A'}</Text>
            <Text style={styles.tableCell}>{instructor.password || 'N/A'}</Text>
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
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInstructors = async () => {
    setIsLoading(true);
    try {
      const response = await client.get('/users');
      // Filter for instructors and program chairs
      // Filter for instructors and program chairs
      const instructorList = response.data.filter(user => user.role === 'instructor' || user.role === 'program_chairperson');
      // Normalize data for display (add name property if needed by other components, or update components to use firstname/lastname)
      const mappedInstructors = instructorList.map(inst => ({
        ...inst,
        id: inst.user_id, // Map user_id to id for compatibility
        name: `${inst.firstname} ${inst.middlename ? inst.middlename + ' ' : ''}${inst.lastname}`
      }));
      setInstructors(mappedInstructors);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
      Alert.alert('Error', 'Failed to fetch instructors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);
  useEffect(() => {
    fetchInstructors();
  }, []);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const headerOptions = [
    { label: 'Create Instructor', value: 'Create Instructor', icon: 'person-add' },
    { label: 'Create Program Chairperson', value: 'Create Program Chair', icon: 'person-add' },
    { label: 'Instructors & Chairs', value: 'Instructors', icon: 'people' },
    { label: 'View Info', value: 'View Info', icon: 'information-circle' },
    { label: 'Logout', value: 'Logout', icon: 'log-out' },
  ];

  const departments = [
    { label: 'BSCS', value: 'BSCS' },
    { label: 'BSED-English', value: 'BSED-English' },
    { label: 'BSED-HR', value: 'BSED-HR' },
    { label: 'BSBA', value: 'BSBA' },
    { label: 'BEED', value: 'BEED' },
  ];

  const showInstructors = headerSelection === 'Instructors';
  const showCreateUser = headerSelection === 'Create Instructor';
  const showCreateChair = headerSelection === 'Create Program Chair';
  const showViewInfo = headerSelection === 'View Info';


  const handleSelectInstructor = (instructorName) => {
    setSelectedInstructor(instructorName);
  };

  const handleBackToInstructors = () => {
    setSelectedInstructor(null);
  };

  const handleDeleteInstructor = async (id) => {
    try {
      await client.delete(`/users/${id}`);
      Alert.alert('Success', 'Instructor deleted successfully');
      fetchInstructors(); // Refresh list
    } catch (error) {
      console.error('Failed to delete instructor:', error);
      Alert.alert('Error', 'Failed to delete instructor');
    }
  };

  const handleSaveUser = async (user) => {
    try {
      await client.post('/users', user);
      Alert.alert("Success", `${user.role === 'program_chairperson' ? 'Program Chairperson' : 'Instructor'} created successfully.`);
      setHeaderSelection(null);
      fetchInstructors(); // Refresh list
    } catch (error) {
      console.error('Failed to create instructor:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create instructor');
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      await client.put(`/users/${userId}`, updatedData);
      Alert.alert("Success", "User updated successfully.");
      setEditingUser(null);
      fetchInstructors(); // Refresh list
    } catch (error) {
      console.error('Failed to update user:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
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
    setSelectedInstructor(null);
    setSelectedDepartment(null);
  };

  useEffect(() => {
    // Reset department selection when changing menu items
    setSelectedDepartment(null);
  }, [headerSelection]);

  const renderDepartmentSelection = () => (
    <View style={styles.departmentListContainer}>
      <Text style={styles.scheduleTitle}>Select Department</Text>
      {departments.map((dept) => (
        <TouchableOpacity
          key={dept.value}
          style={styles.departmentButton}
          onPress={() => setSelectedDepartment(dept.value)}
        >
          <Text style={styles.departmentButtonText}>{dept.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
            {!selectedDepartment ? (
              renderDepartmentSelection()
            ) : (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDepartment(null)}>
                  <Text style={styles.backButtonText}>← Back to Departments</Text>
                </TouchableOpacity>
                <Text style={styles.scheduleTitle}>{departments.find(d => d.value === selectedDepartment)?.label}</Text>

                {editingUser ? (
                  <EditUserForm
                    user={editingUser}
                    onSave={handleUpdateUser}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <>
                    <Text style={styles.scheduleTitle}>Instructors & Chairs</Text>
                    {selectedInstructor ? (
                      <InstructorSchedule
                        instructorName={selectedInstructor}
                        schedule={schedule}
                        onBack={handleBackToInstructors}
                      />
                    ) : (
                      <ScrollView style={{ flex: 1 }}>
                        <Text style={styles.subHeader}>Instructors</Text>
                        <InstructorsList
                          instructors={instructors.filter(u => u.role === 'instructor' && u.department === selectedDepartment)}
                          onSelectInstructor={handleSelectInstructor}
                          onDeleteInstructor={handleDeleteInstructor}
                          onEditInstructor={handleEditClick}
                        />
                        <Text style={styles.subHeader}>Program Chairpersons</Text>
                        <InstructorsList
                          instructors={instructors.filter(u => u.role === 'program_chairperson' && u.department === selectedDepartment)}
                          onSelectInstructor={handleSelectInstructor}
                          onDeleteInstructor={handleDeleteInstructor}
                          onEditInstructor={handleEditClick}
                        />
                      </ScrollView>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {showCreateUser && (
          <CreateUserForm
            onSave={handleSaveUser}
            onCancel={handleCancelCreateUser}
            role="instructor"
            title="Create Instructor"
          />
        )}

        {showCreateChair && (
          <CreateUserForm
            onSave={handleSaveUser}
            onCancel={handleCancelCreateUser}
            role="program_chairperson"
            title="Create Program Chairperson"
          />
        )}

        {showViewInfo && (
          <>
            {!selectedDepartment ? (
              renderDepartmentSelection()
            ) : (
              <ScrollView style={{ flex: 1 }}>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDepartment(null)}>
                  <Text style={styles.backButtonText}>← Back to Departments</Text>
                </TouchableOpacity>
                <Text style={styles.scheduleTitle}>{departments.find(d => d.value === selectedDepartment)?.label} Info</Text>

                <Text style={styles.subHeader}>Instructors</Text>
                <ViewInfoList
                  instructors={instructors.filter(u => u.role === 'instructor' && u.department === selectedDepartment)}
                />

                <Text style={styles.subHeader}>Program Chairpersons</Text>
                <ViewInfoList
                  instructors={instructors.filter(u => u.role === 'program_chairperson' && u.department === selectedDepartment)}
                />
              </ScrollView>
            )}
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
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
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
  departmentListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departmentButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  departmentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DropdownExample;