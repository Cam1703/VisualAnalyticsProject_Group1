# ATP Tennis Players Analytics

**Presented by:**
- **Angelo Trifelli**, 1920939
  
  Email: trifelli.1920939@studenti.uniroma1.it
  
  GitHub: https://github.com/Angelo-Trifelli
- **Júlia Stancioli**, 2175608

  Email: stancioli.2175608@studenti.uniroma1.it

  GitHub: https://github.com/julia-stancioli-sapienza
- **Camila Carrasco**, 2177282

  Email: carrasco.2177282@studenti.uniroma1.it

  GitHub: https://github.com/Cam1703

## Index
- [Prerequisites](#prerequisites)
- [Installation and Launch](#installation-and-launch)

## Prerequisites
Before you begin, make sure you have the following prerequisites in place:
- **Git**: Git is essential for version control. If you don't have Git installed, you can download it from the official website, based on your operating system:
  - [Download Git](https://git-scm.com/downloads)
- **NodeJS**: if you don't have the last version of NodeJS installed, you can download it from the official website, based on your operating system:
  - [Download NodeJS](https://nodejs.org/en)
- **Python**: essential for pre-processing the selected dataset and generate the files used by the dashboard. If you don't have python installed on your pc you can download it from the official website:
  - [Download Python](https://www.python.org/downloads/)   
 
## Installation and Launch
For installing and launching the application, make sure you execute the following procedure:
1. Open a terminal or a command prompt;
2. Navigate to the folder in which you want to clone the repository;
3. Clone the GitHub repository;
4. Navigate to the *data_processing* folder from the terminal and execute the *process_original_files* python script to generate the csv files that will be used by the dashboard;
5. For launching the application:
   - Navigate to the *visual_analytics_app* folder from the terminal:
   - **If you are launching the application for the first time**, execute the following command:
     ```bash
     npm install
     ```
   - Execute the following command:
     ```bash
     npm run dev
     ```
