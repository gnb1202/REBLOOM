flowchart TD
    A[Game Start] --> B{Existing User?}
    B -->|New| C[Sign Up<br/>ID, Password, Surgery Date]
    B -->|Yes| D[Login]
    C --> D

    D --> E{First Access<br/>of the Day?}
    E -->|Yes| F[Daily Health Check<br/>Condition • Pain Areas • Swelling]
    E -->|No| G[Home Screen<br/>Personal Room]
    F --> G

    G --> H[Exercise]
    G --> I[Explore Others' Rooms]
    G --> J[Menu & Settings]
    G --> K[Room Decoration]
    G --> Q[Quest System]

    %% Exercise Flow (Core Feature)
    H --> H1[Today's Recommended Exercise]
    H1 --> H2[Exercise Session<br/>Video Guide + Camera]
    H2 --> H3[Exercise Results<br/>Stats & Completion]
    H3 --> H4[Rewards<br/>Flower Growth + Currency]
    H4 --> H5[Difficulty Feedback]
    H5 --> G

    %% Other Features
    I --> I1[Visit Random User Rooms<br/>Social Motivation]
    I1 --> G

    J --> J1[Flower Management<br/>Collection & Health Report]
    J1 --> G

    K --> K1[Decorate Room<br/>with Earned Items]
    K1 --> G

    %% Quest System Flow
    Q --> Q1[Daily Quests<br/>Exercise • Decoration • Social]
    Q --> Q2[Weekly Challenges<br/>Progress Goals]
    Q --> Q3[Achievement Quests<br/>Special Milestones]
    Q1 --> Q4{Quest Completed?}
    Q2 --> Q4
    Q3 --> Q4
    Q4 -->|Yes| Q5[Quest Rewards<br/>Currency • Items • Bonuses]
    Q4 -->|No| Q6[Quest Progress<br/>Track Completion]
    Q5 --> Q7[Update Quest Status]
    Q6 --> G
    Q7 --> G
    
    %% Quest Integration with Other Features
    H4 -.->|Exercise Quest<br/>Completion| Q7
    I1 -.->|Social Quest<br/>Visit Rooms| Q7
    K1 -.->|Decoration Quest<br/>Room Update| Q7

    %% Weekly Report
    G -.->|Monday 04:00<br/>Auto-generated| L[Weekly Health Report<br/>Progress & Achievements]
    L --> G


    class A,G start
    class C,D,F,H4,L process
    class B,E decision
    class H1,H2,H3,H5 exercise
    class I1,J1,K1 feature
    class Q1,Q2,Q3,Q4,Q5,Q6,Q7 quest
