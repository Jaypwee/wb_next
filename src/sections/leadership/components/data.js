import { _mock } from 'src/_mock';


const group = { product: 'product design', development: 'development', marketing: 'marketing' };


export const GROUP_DATA = {
    group: 'root',
    role: 'ceo, co-founder',
    name: _mock.fullName(1),
    children: [
      {
        group: 'queen',      
        name: 'Queen',
        children: [
          {
            group: 'territorial',
            name: 'Territorial',
            children: [
              {
                group: 'territorial',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'technology',
            name: 'Data & Technology',
            children: [
              {
                group: 'technology',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'war lead',
            name: 'War Lead',
            children: [
              {
                group: 'war lead',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'events',
            name: 'Events',
            children: [
              {
                group: 'events',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'infantry lead',
            name: 'Infantry Lead',  
            children: [
              {
                group: 'infantry lead',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'cavalry lead',
            name: 'Cavalry Lead', 
            children: [
              {
                group: 'cavalry lead',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'international',
            name: 'International',
            children: [
              {
                group: 'international',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'recruitment',
            name: 'Recruitment',
            children: [
              {
                group: 'recruitment',
                name: 'Test',
                role: 'Test engineer'
              },
            ],
          },
          {
            group: 'communications',
            name: 'Communications',
            children: [
              {
                group: 'communications',
                name: 'Test',
                role: 'Test engineer',
                id: '123412343',
                children: [
                  {
                    group: 'communications',
                    name: 'Test',
                    role: 'Test engineer'
                  },
                  {
                    group: 'communications',
                    name: 'Test',
                    role: 'Test engineer',
                    children: [
                      {
                        group: 'communications',
                        name: 'Test',
                        role: 'Test engineer'
                      },
                    ]
                  },
                  
                  
                ]
              },
            ],
          },
        ]

      }
    ]
  };
  