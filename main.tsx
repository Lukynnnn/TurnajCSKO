import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trophy, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === 'LukyJeFrajer') {
      onLogin();
    } else {
      setError('Nesprávné heslo');
    }
  };

  return (
    <Card>
      <CardHeader>Admin přihlášení</CardHeader>
      <CardContent>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Zadejte heslo"
          className="mb-2"
        />
        <Button onClick={handleLogin}>Přihlásit</Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
};

const AdminView = ({ players, setPlayers, roundRobinMatches, setRoundRobinMatches, knockoutMatches, setKnockoutMatches, updateData }) => {
  const [newPlayer, setNewPlayer] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);

  const addPlayer = () => {
    if (newPlayer.trim() !== '') {
      const updatedPlayers = [...players, { name: newPlayer.trim(), wins: 0 }];
      setPlayers(updatedPlayers);
      setNewPlayer('');
      updateData({ players: updatedPlayers });
    }
  };

  const removePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    updateData({ players: updatedPlayers });
  };

  const editPlayer = (index, newName) => {
    const updatedPlayers = players.map((player, i) => 
      i === index ? { ...player, name: newName } : player
    );
    setPlayers(updatedPlayers);
    setEditingPlayer(null);
    updateData({ players: updatedPlayers });
  };

  const generateRoundRobinMatches = () => {
    const matches = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          player1: players[i].name,
          player2: players[j].name,
          winner: null
        });
      }
    }
    setRoundRobinMatches(matches);
    updateData({ roundRobinMatches: matches });
  };

  const setRoundRobinWinner = (matchIndex, winner) => {
    const updatedMatches = roundRobinMatches.map((match, index) => {
      if (index === matchIndex) {
        return { ...match, winner };
      }
      return match;
    });
    setRoundRobinMatches(updatedMatches);

    const updatedPlayers = players.map(player => {
      if (player.name === winner) {
        return { ...player, wins: player.wins + 1 };
      }
      return player;
    });
    setPlayers(updatedPlayers);
    updateData({ roundRobinMatches: updatedMatches, players: updatedPlayers });
  };

  const generateKnockoutMatches = () => {
    const sortedPlayers = [...players].sort((a, b) => b.wins - a.wins);
    const numPlayers = sortedPlayers.length;
    const numRounds = Math.ceil(Math.log2(numPlayers));
    const totalMatches = Math.pow(2, numRounds) - 1;
    
    const matches = new Array(totalMatches).fill().map(() => ({
      player1: 'TBD',
      player2: 'TBD',
      winner: null
    }));

    for (let i = 0; i < Math.min(numPlayers, matches.length); i++) {
      matches[i].player1 = sortedPlayers[i].name;
    }

    setKnockoutMatches(matches);
    updateData({ knockoutMatches: matches });
  };

  const setKnockoutWinner = (matchIndex, winner) => {
    const updatedMatches = [...knockoutMatches];
    updatedMatches[matchIndex].winner = winner;

    if (matchIndex < updatedMatches.length / 2) {
      const nextMatchIndex = updatedMatches.length - 1 - Math.floor((updatedMatches.length - 1 - matchIndex) / 2);
      if (updatedMatches[nextMatchIndex].player1 === 'TBD') {
        updatedMatches[nextMatchIndex].player1 = winner;
      } else {
        updatedMatches[nextMatchIndex].player2 = winner;
      }
    }

    setKnockoutMatches(updatedMatches);
    updateData({ knockoutMatches: updatedMatches });
  };

  const getRequiredPlayersCount = () => {
    return Math.pow(2, Math.ceil(Math.log2(players.length)));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Admin pohled</h2>
      
      <div className="mb-4">
        <Input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          placeholder="Zadejte jméno hráče"
          className="mr-2"
        />
        <Button onClick={addPlayer}><Plus size={16} className="mr-1" /> Přidat hráče</Button>
      </div>
      
      <div className="mb-4">
        {players.map((player, index) => (
          <div key={index} className="flex items-center mb-2">
            {editingPlayer === index ? (
              <Input
                value={player.name}
                onChange={(e) => editPlayer(index, e.target.value)}
                onBlur={() => setEditingPlayer(null)}
                autoFocus
              />
            ) : (
              <>
                <span className="mr-2">{player.name} - Výhry: {player.wins}</span>
                <Button variant="outline" size="sm" onClick={() => setEditingPlayer(index)}><Edit2 size={16} /></Button>
              </>
            )}
            <Button variant="destructive" size="sm" onClick={() => removePlayer(index)}><Minus size={16} /></Button>
          </div>
        ))}
      </div>
      
      <p className="mb-4">Potřebný počet hráčů pro další velikost turnaje: {getRequiredPlayersCount()}</p>
      
      <Button onClick={generateRoundRobinMatches} className="mb-4 mr-2">Generovat zápasy každý s každým</Button>
      <Button onClick={generateKnockoutMatches} className="mb-4">Generovat vyřazovací zápasy</Button>
      
      <h3 className="text-lg font-bold mb-2">Zápasy každý s každým</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {roundRobinMatches.map((match, index) => (
          <Card key={index}>
            <CardHeader>Zápas {index + 1}</CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => setRoundRobinWinner(index, match.player1)}
                  variant={match.winner === match.player1 ? "default" : "outline"}
                >
                  {match.player1}
                </Button>
                <span>vs</span>
                <Button 
                  onClick={() => setRoundRobinWinner(index, match.player2)}
                  variant={match.winner === match.player2 ? "default" : "outline"}
                >
                  {match.player2}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-lg font-bold mb-2">Vyřazovací zápasy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knockoutMatches.map((match, index) => (
          <Card key={index}>
            <CardHeader>Zápas {index + 1}</CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => setKnockoutWinner(index, match.player1)}
                  variant={match.winner === match.player1 ? "default" : "outline"}
                  disabled={match.player1 === 'TBD'}
                >
                  {match.player1}
                </Button>
                <span>vs</span>
                <Button 
                  onClick={() => setKnockoutWinner(index, match.player2)}
                  variant={match.winner === match.player2 ? "default" : "outline"}
                  disabled={match.player2 === 'TBD'}
                >
                  {match.player2}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BracketMatch = ({ match }) => (
  <div className="flex flex-col items-center justify-center border p-2 m-1">
    <div className={`w-full ${match.winner === match.player1 ? 'font-bold' : ''}`}>{match.player1}</div>
    <div className={`w-full ${match.winner === match.player2 ? 'font-bold' : ''}`}>{match.player2}</div>
  </div>
);

const TournamentBracket = ({ matches }) => {
  const rounds = Math.ceil(Math.log2(matches.length + 1));

  return (
    <div className="flex justify-around w-full overflow-x-auto">
      {Array.from({ length: rounds }, (_, roundIndex) => {
        const roundMatches = matches.filter((_, index) => 
          index >= Math.pow(2, rounds - roundIndex - 1) - 1 &&
          index < Math.pow(2, rounds - roundIndex) - 1
        );
        return (
          <div key={roundIndex} className="flex flex-col justify-around h-full">
            <h4 className="text-center font-bold mb-2">Kolo {roundIndex + 1}</h4>
            {roundMatches.map((match, index) => (
              <BracketMatch key={index} match={match} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

const UserView = ({ players, roundRobinMatches, knockoutMatches }) => {
  const getWinner = () => {
    const finalMatch = knockoutMatches[knockoutMatches.length - 1];
    return finalMatch ? finalMatch.winner : null;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Uživatelský pohled</h2>
      
      <Card className="mb-4">
        <CardHeader>Hráči a skóre</CardHeader>
        <CardContent>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player.name} - Výhry: {player.wins}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>Výsledky zápasů každý s každým</CardHeader>
        <CardContent>
          <ul>
            {roundRobinMatches.map((match, index) => (
              <li key={index}>
                {match.player1} vs {match.player2}: {match.winner ? `Vítěz - ${match.winner}` : 'Ještě nehráno'}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>Turnajový pavouk</CardHeader>
        <CardContent>
          <TournamentBracket matches={knockoutMatches} />
        </CardContent>
      </Card>
      
      {getWinner() && (
        <Card>
          <CardHeader>Vítěz turnaje</CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Trophy size={24} className="mr-2 text-yellow-500" />
              <span className="text-xl font-bold">{getWinner()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CSGOTournament = () => {
  const [players, setPlayers] = useState([]);
  const [roundRobinMatches, setRoundRobinMatches] = useState([]);
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mode, setMode] = useState('roundRobin'); // 'roundRobin' or 'knockout'

  useEffect(() => {
    const savedData = localStorage.getItem('tournamentData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setPlayers(parsedData.players || []);
      setRoundRobinMatches(parsedData.roundRobinMatches || []);
      setKnockoutMatches(parsedData.knockoutMatches || []);
    }
  }, []);

  const updateData = (newData) => {
    const updatedData = {
      players: newData.players || players,
      roundRobinMatches: newData.roundRobinMatches || roundRobinMatches,
      knockoutMatches: newData.knockoutMatches || knockoutMatches,
    };
    localStorage.setItem('tournamentData', JSON.stringify(updatedData));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">CS:GO Turnaj</h1>
        {isAdminLoggedIn ? (
          <Button onClick={() => setIsAdminLoggedIn(false)}>Odhlásit admin</Button>
        ) : (
          <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
        )}
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="roundRobin">Každý s každým</TabsTrigger>
          <TabsTrigger value="knockout">Vyřazovací</TabsTrigger>
        </TabsList>

        <TabsContent value="roundRobin">
          {isAdminLoggedIn ? (
            <AdminView
              players={players}
              setPlayers={setPlayers}
              roundRobinMatches={roundRobinMatches}
              setRoundRobinMatches={setRoundRobinMatches}
              knockoutMatches={knockoutMatches}
              setKnockoutMatches={setKnockoutMatches}
              updateData={updateData}
            />
          ) : (
            <UserView
              players={players}
              roundRobinMatches={roundRobinMatches}
              knockoutMatches={knockoutMatches}
            />
          )}
        </TabsContent>

        <TabsContent value="knockout">
          {isAdminLoggedIn ? (
            <AdminView
              players={players}
              setPlayers={setPlayers}
              roundRobinMatches={roundRobinMatches}
              setRoundRobinMatches={setRoundRobinMatches}
              knockoutMatches={knockoutMatches}
              setKnockoutMatches={setKnockoutMatches}
              updateData={updateData}
            />
          ) : (
            <UserView
              players={players}
              roundRobinMatches={roundRobinMatches}
              knockoutMatches={knockoutMatches}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSGOTournament;
